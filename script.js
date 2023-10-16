export class Script{
    /** 
     * @param {import(".").NS } ns
     * @param {string} file
     * @param {number} threads
     * @param  {(string | number | boolean)[]} args
    */
    constructor(ns, file, threads=0, args=[]){
        this.ns = ns
        this.file = file
        this.threads = threads
        this.args = args
    }

    /** 
     * @param {import(".").Server} server
     * @returns {number} 
     */
    time(server){
        throw "not implemented"
    }

    /** 
     * @param {import(".").Server} server
     * @param {number} target
     * @param {number} offset
     * @returns {number}
     */
    calc_delay(server, target, offset=0){
        return target - this.time(server) + offset

    }

    /**
     * @param {import(".").Server} server 
     * @returns {import(".").Server}
     */
    apply(server){
        throw "not implemented"
    }

    getRam(){
        return this.ns.getScriptRam(this.file)
    }
}

export class HackScript extends Script{
    constructor(ns, threads=0){
        super(ns, "h.js", threads)
    }

    /** 
     * @param {import(".").Server} server
     * @returns {number} 
     */
    time(server){
        let player = this.ns.getPlayer()
        return this.ns.formulas.hacking.hackTime(server, player)
    }

    /**
     * @param {import(".").Server} server 
     * @returns {import(".").Server}
     */
    apply(server){
        let player = this.ns.getPlayer();
        server.moneyAvailable -= Math.max(0, server.moneyAvailable * this.ns.formulas.hacking.hackPercent(server, player) * this.threads);
        server.hackDifficulty += this.ns.hackAnalyzeSecurity(this.threads);
        return server;
    }
}

export class GrowScript extends Script{
    constructor(ns, threads=0){
        super(ns, "g.js", threads)
    }

    /** 
     * @param {import(".").Server} server
     * @returns {number} 
     */
    time(server){
        let player = this.ns.getPlayer()
        return this.ns.formulas.hacking.growTime(server, player)
    }

    /**
     * @param {import(".").Server} server 
     * @returns {import(".").Server}
     */
    apply(server){
        throw "not implemented"
    }

    /**
     * @param {import(".").Server} server 
     * @returns {import(".").Server}
     */
    apply(server){
        let player = this.ns.getPlayer();
        server.moneyAvailable = Math.min(server.moneyMax, server.moneyAvailable * this.ns.formulas.hacking.growPercent(server, this.threads, player));
        server.hackDifficulty += this.ns.growthAnalyzeSecurity(this.threads);
        return server;
    }
}

export class WeakenScript extends Script{
    constructor(ns, threads=0){
        super(ns, "w.js", threads)
    }

    /** 
     * @param {import(".").Server} server
     * @returns {number} 
     */
    time(server){
        let player = this.ns.getPlayer()
        return this.ns.formulas.hacking.weakenTime(server, player)
    }

    /**
     * @param {import(".").Server} server 
     * @returns {import(".").Server}
     */
    apply(server){
        server.hackDifficulty -= this.ns.weakenAnalyze(this.threads)
        return server;
    }
}