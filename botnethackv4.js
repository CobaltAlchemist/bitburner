import { ExecutingScript, SwarmManager } from "./botnet";
import { FormulasPlanner } from "./planner";
import { Batch } from "./batch";

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (!(ns.args.includes("debug"))){
        ns.disableLog("ALL");
    }
    const botnet = new SwarmManager(ns, "home" in ns.args);
    botnet.scp(["h.js", "w.js", "g.js"], "home");
	const target = ns.args[0];
    let batchNum = 0;
    let server = ns.getServer(target);
    let scripts = undefined
    while (true){
        botnet.reloadServers();
        let planner = new FormulasPlanner(ns, botnet)
        ns.printf("Starting sec: %d/%d\nmon: %s/%s",
            server.hackDifficulty, server.minDifficulty,
            ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"));
        let pct = 0.9
        let toExec = planner.plan(server, pct);
        let batch = new Batch(ns, 40, 100, ...toExec)
        toExec = batch.getActions(server).map((ds, i) => {
            let script = ds.script
            ns.printf("%s: %d", script.file, script.threads)
            script.args = [server.hostname, ds.delay, batchNum]
            return script
        })
        ns.print("Executing plan:");
        let scripts = botnet.runMulti(toExec)
        if (scripts.length > 0){
            ns.printf("Finished batch %d", batchNum++);
        } else {
            ns.print("Failed to exec batch");
        }
        await ns.sleep(batch.batchDelay());
    }
}