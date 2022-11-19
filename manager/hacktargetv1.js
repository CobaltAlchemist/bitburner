/** @param {import("..").NS } ns */
export async function main(ns) {
	ns.wget("https://github.com/CobaltAlchemist/bitburner/blob/main/manager/h.js");
	ns.wget("https://github.com/CobaltAlchemist/bitburner/blob/main/manager/g.js");
	ns.wget("https://github.com/CobaltAlchemist/bitburner/blob/main/manager/w.js");
	var target = ns.args[0]
    var last_script = 0
    while (true){
        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel()){
            last_script = ns.exec("w.js", ns.getServer(), threads(ns, "w.js"), target);
        }
        else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney()){
            last_script = ns.exec("g.js", ns.getServer(), threads(ns, "g.js"), target);
        }
        else if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel()){
            last_script = ns.exec("h.js", ns.getServer(), threads(ns, "h.js"), target);
        }
        while (ns.scriptRunning(last_script)){
            ns.sleep(100);
        }
    }
}

/** @param {import("..").NS } ns */
function threads(ns, script){
	return floor(ns.getScriptRam(script) / (ns.getServerMaxRam() - ns.getServerUsedRam()))
}