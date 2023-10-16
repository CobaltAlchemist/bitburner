import { SwarmManager } from "./botnet";
import { explore } from "./explore";
import { formatMoney } from "./utils";

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (!(ns.args.includes("debug"))){
        ns.disableLog("ALL");
    }
    ns.printf(`Running botnet with ${ns.args.join(",")}`)
    let server_scripts = {}
    while (true){
        const botnet = new SwarmManager(ns, ns.args.includes("home"));
        botnet.scp(["h.js", "w.js", "g.js"], "home");
        const targets = explore(ns)
            .map(x => ns.getServer(x))
            .filter(x => 
                x.requiredHackingSkill <= ns.getHackingLevel() && 
                x.moneyAvailable > 0 && x.hasAdminRights &&
                ns.getGrowTime(x.hostname) < 1000 * 60 &&
                ns.getHackTime(x.hostname) < 1000 * 60 &&
                ns.getWeakenTime(x.hostname) < 1000 * 60)
        botnet.reloadServers();
        targets.forEach(server => {
            if (!(server.hostname in server_scripts)){
                server_scripts[server.hostname] = []
            }
            if (!botnet.isRunningScripts(server_scripts[server.hostname])){
                if (server.hackDifficulty > server.minDifficulty + 0.05){
                    let w = Math.ceil((server.hackDifficulty - server.minDifficulty) / 0.05)
                    w = Math.min(w, botnet.maxThreads("w.js"))
                    if (w > 0) {
                        ns.printf("Weakening %s with %d threads", server.hostname, w)
                        printServer(ns, server)
                        server_scripts[server.hostname] = botnet.run("w.js", w, server.hostname)
                    }
                } else if (server.moneyAvailable < server.moneyMax){
                    let g = Math.ceil(ns.growthAnalyze(server.hostname, server.moneyMax / server.moneyAvailable))
                    g = Math.min(g, botnet.maxThreads("g.js"))
                    if (g > 0) {
                        ns.printf("Growing %s with %d threads", server.hostname, g)
                        printServer(ns, server)
                        server_scripts[server.hostname] = botnet.run("g.js", g, server.hostname)
                    }
                } else {
                    let h = Math.floor(ns.hackAnalyzeThreads(server.hostname, server.moneyAvailable / 2))
                    h = Math.min(h, botnet.maxThreads("h.js"))
                    if (h > 0) {
                        ns.printf("Hacking %s with %d threads", server.hostname, h)
                        printServer(ns, server)
                        server_scripts[server.hostname] = botnet.run("h.js", h, server.hostname)
                    }
                }
            }
        })
        await ns.sleep(1000);
    }
}

/**
 * 
 * @param {import(".").NS} ns 
 * @param {import(".").Server} server 
 */
function printServer(ns, server){
    ns.printf(
        `${server.hostname}\n` +
        `Security: ${Math.round(server.hackDifficulty * 10) / 10}/${server.minDifficulty}\n` +
        `Money: ${formatMoney(ns, server.moneyAvailable)}/${formatMoney(ns, server.moneyMax)}`
    )
}