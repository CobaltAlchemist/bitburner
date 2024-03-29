/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("disableLog");
    ns.disableLog("enableLog");
    var self = ns.getServer();
    ns.scp(["h.js", "w.js", "g.js"], self.hostname, "home");
	var target = ns.args[0]
    var last_script = 0
    while (true){
        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)){
            var n_t = threads(ns, "w.js");
            ns.printf("Running weaken with %d threads...", n_t);
            if (0 == n_t){
                ns.printf("Not enough RAM!");
                await ns.sleep(1000);
                continue;
            }
            last_script = ns.exec("w.js", self.hostname, n_t, target);
        }
        else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)){
            var n_t = threads(ns, "g.js");
            ns.printf("Running grow with %d threads...", n_t);
            if (0 == n_t){
                ns.printf("Not enough RAM!");
                await ns.sleep(1000);
                continue;
            }
            last_script = ns.exec("g.js", self.hostname, n_t, target);
        }
        else {
            var n_t = threads(ns, "h.js");
            ns.printf("Running hack with %d threads...", n_t);
            if (0 == n_t){
                ns.printf("Not enough RAM!");
                await ns.sleep(1000);
                continue;
            }
            last_script = ns.exec("h.js", self.hostname, n_t, target);
        }
        while (ns.isRunning(last_script, self.hostname)){
            ns.disableLog("sleep");
            await ns.sleep(100);
            ns.enableLog("sleep");
        }
        await ns.sleep(100);
    }
}

/** @param {import("..").NS } ns */
function threads(ns, script){
    var self = ns.getServer();
	return Math.floor((ns.getServerMaxRam(self.hostname) - ns.getServerUsedRam(self.hostname)) / ns.getScriptRam(script))
}