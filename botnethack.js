import { ExecutingScript, SwarmManager } from "./botnet";

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
    const hforms = ns.formulas.hacking
    let player = ns.getPlayer()
    while (true){
        botnet.reloadServers();
        let server = ns.getServer(target);
        let maxRam = botnet.getServerMaxRam();
        let ramUsed = botnet.getServerUsedRam();
        let endSec = server.hackDifficulty;
        let initMon = server.moneyAvailable;
        let h = 0;
        let g = 0;
        let w = 0;

        let minRam = Math.max(
            ns.getScriptRam("h.js"),
            ns.getScriptRam("w.js"),
            ns.getScriptRam("g.js"),
        );
        if (server.moneyAvailable == 0)
            throw "Server ran out of funds...";
                
        let target_time = Math.max(
            hforms.hackTime(server, player),
            hforms.growTime(server, player) + 500,
            hforms.weakenTime(server, player) + 1000);

        ns.printf("Starting  sec: %d/%d\nmon: %s/%s\nDistributing threads to %s ram down to %s",
            server.hackDifficulty, server.minDifficulty,
            ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"),
            ns.nFormat(maxRam - ramUsed, "0.0a"), ns.nFormat(minRam, "0.0a"));

        while ((maxRam - ramUsed) > minRam){
            if (endSec > server.minDifficulty + 0.05){
                w++; 
                endSec -= 0.05
                ramUsed += ns.getScriptRam("w.js");
                continue;
            }
            if (server.moneyAvailable * hforms.growPercent(server, g, player) < server.moneyMax){
                g++;
                endSec += 0.004;
                ramUsed += ns.getScriptRam("g.js");
                continue;
            }
            if (hforms.hackPercent(server, player) * h > 0.9){
                h = Math.max(0, h-1);
                break;
            }
            h++;
            server.hackDifficulty += 0.002;
            endSec += 0.002;
            server.moneyAvailable -= initMon * (Math.min(1, hforms.hackChance(server, player) * 2)) * hforms.hackPercent(server, player)
            ramUsed += ns.getScriptRam("h.js");
        }

        ns.printf("Executing plan %d, %d, %d", h, g, w);
        /** @type {ExecutingScript[]} */
        let scripts = []
        scripts = scripts.concat(botnet.run("h.js", h, target, target_time - hforms.hackTime(server, player)));
        scripts = scripts.concat(botnet.run("g.js", g, target, target_time - hforms.growTime(server, player) + 500));
        scripts = scripts.concat(botnet.run("w.js", w, target, target_time - hforms.weakenTime(server, player) + 1000));
        while (botnet.isRunningScripts(scripts)){
            await ns.sleep(1000);
        }
        
        ns.printf("Finished batch");
        await ns.sleep(1000);
    }
}