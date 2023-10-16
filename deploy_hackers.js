/** @param {import(".").NS } ns */
export async function main(ns) {
    var debug = ns.args[0] == "debug";
    var targets = get_targets(ns);
    var sorted_targets = targets.map(
        host => ns.getServer(host)
    ).filter(
        server => server.moneyAvailable > 0 && server.requiredHackingSkill <= ns.getHackingLevel()
    ).sort(
        (a, b) => b.moneyMax - a.moneyMax
    ).map(server => server.hostname)

    // var farm = ns.getPurchasedServers();
    
    if (ns.fileExists("Formulas.exe", "home")){
        targets.forEach(h =>{
                    if (ns.scriptRunning("hacktargetv2.js", h)){
                        ns.scriptKill("hacktargetv2.js", h)
                    }
                })
        if (ns.isRunning("early_botnet.js", "home", "home")){
            ns.scriptKill("early_botnet.js", "home")
        }
        ns.run("deploy_botnets.js")
        return
    }
    else{
        ns.run("early_botnet.js", 1, "home")
        return
    }
 
    var idx = 0
    targets.map(
        host => ns.getServer(host)
    ).filter(
        server => server.maxRam > 0
    ).sort(
        (a, b) => b.maxRam - a.maxRam
    ).forEach(
        server=> {
            ns.scp("hacktargetv2.js", server.hostname, "home");
            var target = sorted_targets[idx];
            idx = (idx + 1) % sorted_targets.length;
            if (target === undefined)
                return;
            if (debug){
                ns.tprintf("Assigning %s (%s) to %s ($%s)...",
                    server.hostname,
                    ns.nFormat(server.maxRam, "0.0a"),
                    target,
                    ns.nFormat(ns.getServerMaxMoney(target), "0.0a"));
            }
            ns.killall(server.hostname);
            ns.exec("hacktargetv2.js", server.hostname, 1, target);
        }
    );
}


/** @param {import(".").NS } ns */
function get_targets(ns) {
    var hosts = []
    ns.scan().forEach(host => explore(ns, host, hosts));
    return hosts;
}

/** @param {import(".").NS } ns */
function explore(ns, host, hosts) {
    var server = ns.getServer(host);
    var money = ns.getServerMaxMoney(host);
    var debug = ns.args[0] == "debug";
    if (hosts.includes(host) || !ns.hasRootAccess(host) || "home" === host){
        return;
    }
    if (debug){
        ns.tprintf("Host %s, %s", server.hostname, ns.nFormat(money, "0.0a"));
    }
    hosts.push(host)
    ns.scan(host).forEach(next => {
        explore(ns, next, hosts);
    })
}