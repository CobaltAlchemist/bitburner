/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("sleep");
    var self = ns.getServer();
    if (ns.getHostname() != "home"){
        ns.scp(["h.js", "w.js", "g.js"], self.hostname, "home");
    }
	var target = ns.args[0]
    ns.scriptKill("h.js", self.hostname);
    ns.scriptKill("w.js", self.hostname);
    ns.scriptKill("g.js", self.hostname);
    var grow_coeff = 10;
    while (true){
        var hack = new Script(ns, "hack", target);
        var grow = new Script(ns, "grow", target);
        var weaken = new Script(ns, "weaken", target);
        var server = ns.getServer(target);
        self = ns.getServer();
        var h = 0;
        var g = 0;
        var w = 0;
        var minRam = Math.max(hack.ram, grow.ram, weaken.ram);
        if (ns.getHostname() == "home")
            minRam += 16
        var target_time = Math.max(hack.duration, grow.duration + grow.offset, weaken.duration + weaken.offset);
        if (server.moneyAvailable == 0)
            throw "Server ran out of funds..."
        var min_g = ns.growthAnalyze(target, server.moneyMax / server.moneyAvailable);
        ns.printf("Starting  sec: %d/%d\nmon: %s/%s(t=%d)\nDistributing threads to %s ram down to %s",
            server.hackDifficulty, server.minDifficulty,
            ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"), min_g,
            ns.nFormat(self.maxRam - self.ramUsed, "0.0a"), ns.nFormat(minRam, "0.0a"));
        while ((self.maxRam - self.ramUsed) > minRam && h < 50){
            if (server.hackDifficulty > server.minDifficulty + 0.05){
                w++;
                server.hackDifficulty -= 0.05;
                self.ramUsed += weaken.ram;
                continue;
            }
            //if (g < grow_coeff * h || server.moneyAvailable < server.moneyMax * 0.5){
            if (g < 4 * h || g < min_g){
                g++;
                self.ramUsed += grow.ram;
                continue;
            }
            h++;
            self.ramUsed += hack.ram;
        }
        ns.printf("Executing plan %d, %d, %d", h, g, w);
        hack.async_exec(self.hostname, target, h, target_time);
        grow.async_exec(self.hostname, target, g, target_time);
        weaken.async_exec(self.hostname, target, w, target_time);

        while (ns.scriptRunning(hack.script, self.hostname) ||
                ns.scriptRunning(grow.script, self.hostname) ||
                ns.scriptRunning(weaken.script, self.hostname)){
            await ns.sleep(100);
        }
        if (ns.getServerMoneyAvailable(target) < server.moneyAvailable)
            grow_coeff += 0.5;
        else
            grow_coeff -= 0.5;
        ns.printf("Finished batch (%d)", grow_coeff);
        await ns.sleep(100);
    }
}

class Script{
    ns;
    duration;
    script;
    offset;
    ram;

    /** 
     * @param {import(".").NS } ns 
     * @param {string} type
    */
    constructor(ns, type, host){
        switch(type){
            case "hack":
                this.duration = ns.getHackTime(host);
                this.script = "h.js";
                this.offset = 0;
                break;
            case "grow":
                this.duration = ns.getGrowTime(host);
                this.script = "g.js";
                this.offset = 500;
                break;
            case "weaken":
                this.duration = ns.getWeakenTime(host);
                this.script = "w.js";
                this.offset = 1000;
                break;
            default:
                throw "Invalid type for script"
        }
        this.ram = ns.getScriptRam(this.script);
        this.ns = ns;
    }

    /** 
     * @param {string} host
     * @param {string} target
     * @param {number} threads
     * @param {number} time
     * @return {Promise<number>}
     */
    async async_exec(host, target, threads, time){
        if (threads == 0)
            return 0;
        this.ns.printf(`Running script ${this.script} with ${threads} threads`);
        return this.ns.exec(
            this.script,
            host,
            threads,
            target,
            time - this.duration + this.offset);
    }

    /**
     * @param {string} host
     */
    scp(host){
        this.ns.scp(this.script, host, "home");
    }
}

/** @param {import(".").NS } ns */
function threads(ns, script){
    var self = ns.getServer();
	return Math.floor((ns.getServerMaxRam(self.hostname) - ns.getServerUsedRam(self.hostname)) / ns.getScriptRam(script))
}