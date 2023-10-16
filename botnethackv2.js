import { ExecutingScript, SwarmManager } from "./botnet";
import { FormulasPlanner, IdealPlanner } from "./planner";

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (ns.args[1] != "debug"){
        ns.disableLog("sleep");
        ns.disableLog("scp");
        ns.disableLog("scan");
        ns.disableLog("exec");
    }
    const botnet = new SwarmManager(ns);
    botnet.scp(["h.js", "w.js", "g.js"], "home");
	const target = ns.args[0]
    let batch = 0
    let idealserver = ns.getServer(target)
    idealserver.moneyAvailable = idealserver.moneyMax;
    idealserver.hackDifficulty = idealserver.minDifficulty;
    while (true){
        botnet.reloadServers();
        let server = ns.getServer(target);

        if (server.moneyAvailable == 0)
            throw "Server ran out of funds...";

        ns.printf("Starting sec: %d/%d\nmon: %s/%s",
            server.hackDifficulty, server.minDifficulty,
            ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"));
        let scripts = [];
        let target_time = 0;
        [scripts, _] = run_batch(ns, botnet, server);
        while (botnet.isRunningScripts(scripts)){
            await ns.sleep(1000);
        }
        [scripts, target_time] = run_batch(ns, botnet, idealserver)
        for (let i = 0; i < target_time - 3000; i+=3000){
            ns.printf("Launching minibatch %d", Math.floor(i / 3000));
            await ns.sleep(3000);
            scripts = scripts.concat(run_batch(ns, botnet, idealserver)[0]);
        }
        while (botnet.isRunningScripts(scripts)){
            await ns.sleep(1000);
        }
        
        ns.printf("Finished batch %d", batch++);
        await ns.sleep(3000);
    }
}

/** 
 * @param {import(".").NS } ns 
 * @param {SwarmManager} botnet
 * @param {import(".").Server} server
 * @return {[ExecutingScript[], number]}
 */
function run_batch(ns, botnet, server) {
    const hforms = ns.formulas.hacking
    let player = ns.getPlayer()
    let planner = new FormulasPlanner(ns, botnet);
    let toExec = planner.plan(server);
    let target_time = Math.max(
        hforms.hackTime(server, player),
        hforms.weakenTime(server, player) + 500,
        hforms.growTime(server, player) + 1000,
        hforms.weakenTime(server, player) + 1500);

    ns.print("Executing plan:");
    /** @type {ExecutingScript[]} */
    let scripts = []
    toExec.forEach((s, i) => {
        ns.printf("%s: %d", s.file, s.threads);
        scripts = scripts.concat(
            botnet.run(s.file, s.threads, server.hostname, s.calc_delay(server, target_time, i * 500))
        )
    })
    return [scripts, target_time];
}