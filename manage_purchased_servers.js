import { formatRam } from "./utils";

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (!(ns.args.includes("debug"))){
        ns.disableLog("ALL");
    }
    var id = ns.getPurchasedServers().length;
    while (true){
        var servers = ns.getPurchasedServers();
        if (servers.length < ns.getPurchasedServerLimit()){
            while (ns.getServerMoneyAvailable("home") < 2 * ns.getPurchasedServerCost(16))
                await ns.sleep(1000);
            ns.purchaseServer(ns.sprintf("pserver-%d", id++), 16);
            ns.exec("deploy_hackers.js", ns.getServer().hostname);
            continue;
        }
        var worst = servers.sort(
            (a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b)
        )
        var uptar = ns.getServer(worst[0]);
        displayServers(ns, servers, uptar.hostname)
        let moneyFactor = 4
        if (!ns.fileExists("Formulas.exe") && uptar.maxRam > 1024){
            moneyFactor = 100
        }
        if (ns.fileExists("Formulas.exe")){
            let loaded = servers
                .map(server => ns.getServerUsedRam(server) / ns.getServerMaxRam(server))
                .filter(p => p > 0.75)
                .length
            if (loaded <= 20){
                ns.printf("Only %d loaded servers", loaded)
                moneyFactor = 100
            }
        }
        var nextram = uptar.maxRam * 2;
        while(ns.getPurchasedServerCost(nextram * 2) < ns.getServerMoneyAvailable("home") / moneyFactor){
            nextram = nextram * 2;
        }
        if (isNaN(ns.getPurchasedServerCost(nextram))){
            return
        }

        if (ns.getServerMoneyAvailable("home") > moneyFactor * ns.getPurchasedServerCost(nextram)){
            ns.printf("Buying new server for %s (%s -> %s)",
                uptar.hostname,
                ns.nFormat(uptar.maxRam * 1e9, "0b"),
                ns.nFormat(nextram * 1e9, "0b"))
            ns.killall(uptar.hostname);
            ns.deleteServer(uptar.hostname);
            ns.purchaseServer(uptar.hostname, nextram);
            ns.printf(
                "Upgraded server %s from %s to %s",
                uptar.hostname,
                ns.nFormat(uptar.maxRam * 1e9, "0b"),
                ns.nFormat(nextram * 1e9, "0b"))
            ns.exec("deploy_hackers.js", ns.getServer().hostname);
        }
        else{
            ns.printf("Not enough money to purchase %s of ram (%s)",
                ns.nFormat(nextram * 1e9, "0b"), ns.nFormat(ns.getPurchasedServerCost(nextram), "($0.00a)"))
            await ns.sleep(10000)
        }
        await ns.sleep(1000)
    }
}

/**
 * 
 * @param {import(".").NS} ns 
 * @param {string[]} servers 
 * @param {string} servers 
 */
function displayServers(ns, servers, marked){
    let items = servers.map(
        server => ns.sprintf(`${server}${(server==marked) ? '*': ''}: ${formatRam(ns, ns.getServerMaxRam(server))}`)
    )
    for (let row = 0; row < 24 / 3; row++){
        ns.printf(items.slice(row * 3, (row + 1) * 3).join("\t"))
    }
}