/** @param {import(".").NS } ns */
export async function main(ns) {
    var hosts = []
    var hacktime = ns.getHackTime();
    var weaktime = ns.getWeakenTime();
    var growtime = ns.getGrowTime();
    var ramcost = ns.getScriptRam();
    ns.scan().forEach(host =>{explore(ns, host, hosts);    });
}

/** @param {import(".").NS } ns */
function explore(ns, host, hosts) {
    if (hosts.includes(host) || !ns.hasRootAccess(host)){
        return;
    }
    var minsec = ns.getServerMinSecurityLevel(host);
    var maxmon = ns.getServerMaxMoney(host);
    var sec = ns.getServerSecurityLevel(host);
    var money = ns.getServerMoneyAvailable(host);
    ns.tprintf("Host %s, %d, %d, %d, %d", host, minsec, maxmon, sec, money);
    hosts.push(host)
    ns.scan(host).forEach(next => {
        explore(ns, next, hosts);
    })
}