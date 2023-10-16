import { ExecutingScript, SwarmManager } from "./botnet";
import { FormulasPlanner } from "./planner";

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (!(ns.args.includes("debug"))){
        ns.disableLog("ALL");
    }
    const botnet = new SwarmManager(ns, "home" in ns.args);
    botnet.scp(["h.js", "w.js", "g.js"], "home");
	const target = ns.args[0];
    let batch = 0;
    let server = ns.getServer(target);
    let scripts = undefined;
    while (true){
        botnet.reloadServers();

        if (server.moneyAvailable == 0)
            throw "Server ran out of funds...";

        ns.printf("Starting sec: %d/%d\nmon: %s/%s",
            server.hackDifficulty, server.minDifficulty,
            ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"));
        //[scripts, server] = run_batch(ns, botnet, server);
        scripts = run_batch(ns, botnet, server, batch);
        
        if (scripts.length > 0){
            ns.printf("Finished batch %d", batch++);
        } else {
            ns.print("Failed to exec batch");
        }
        await ns.sleep(1000);
    }
}

/** 
 * @param {import(".").NS } ns 
 * @param {SwarmManager} botnet
 * @param {import(".").Server} server
 * @param {number} batch
 * @return {[ExecutingScript[], number]}
 */
function run_batch(ns, botnet, server, batch) {
    const hforms = ns.formulas.hacking
    let player = ns.getPlayer()
    let planner = new FormulasPlanner(ns, botnet);
    let pct = 0.9
    let toExec = planner.plan(server, pct);
    while (planner.planCost(toExec) > (botnet.getServerMaxRam() - botnet.getServerUsedRam())){
        pct -= 0.1
        toExec = planner.plan(server, pct)
    }
    if (pct == 0){
        ns.print("Throttling...")
        return []
    }
    let target_time = Math.max(
        hforms.hackTime(server, player),
        hforms.weakenTime(server, player) + 200,
        hforms.growTime(server, player) + 400,
        hforms.weakenTime(server, player) + 600);
    toExec.forEach((script, i) => {
        ns.printf("%s: %d", script.file, script.threads)
        script.args = [server.hostname, script.calc_delay(server, target_time, i * 200), batch]
    })
    ns.print("Executing plan:");
    return botnet.runMulti(toExec)
}