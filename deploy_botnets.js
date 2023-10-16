import { SwarmManager } from "./botnet";
import { explore } from "./explore";
import { FormulasPlanner } from "./planner";

/** @param {import(".").NS } ns */
export async function main(ns) {
    const botnet = new SwarmManager(ns)
    const planner = new FormulasPlanner(ns, botnet)
    const candidates = explore(ns)
        .map(s => ns.getServer(s))
        .filter(s => s.requiredHackingSkill < ns.getHackingLevel())
        .filter(s => s.moneyAvailable > 0)
        .filter(s => ns.getWeakenTime(s.hostname) < 1000 * 60 * 10)
        .sort((a, b) => planner.serverValue(b) - planner.serverValue(a))
        .map(s => s.hostname)
    //candidates.forEach(s => ns.tprintf("%s - %v", s, planner.serverValue(ns.getServer(s))))
    botnet.scp(["h.js", "w.js", "g.js"], "home");

    for (let i = 0; i < candidates.length; i++){
        let server = candidates[i];
        if (ns.isRunning("botnethackv4.js", undefined, server)){
            continue;
        }
        if (botnet.getServerUsedRam() > botnet.getServerMaxRam() * 0.8){
            break; 
        }
        ns.printf("Ramping up... %s", server);
        ns.run("botnethackv4.js", undefined, server);
        await ns.sleep(2000);
        botnet.reloadServers();
    }
    ns.printf("done");
}