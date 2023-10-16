import { SwarmManager } from "./botnet"
import { HackScript, WeakenScript, GrowScript, Script } from "./script"

export class Planner{

    /** 
     * @param {import(".").NS } ns
     * @param {SwarmManager} sm
    */
    constructor(ns, sm){
        this.ns = ns
        this.sm = sm
    }

    /**
     * @param {import(".").Server} server
     * @param {number} pct
     * @returns {Script[]}
     */
    plan(server, pct){
        let maxRam = this.sm.getServerMaxRam()
        let ramUsed = this.sm.getServerUsedRam()
        var plan = this.initPlan(server, pct)
        while (this.step(server, plan, pct)){
            this.step(server, plan, pct)
        }
        return plan
    }

    /**
     * @param {import(".").Server} server
     * @param {Script[]} plan
     * @param {number} pct
     * @returns {boolean}
     */
    step(server, plan, pct){
        return false
    }

    /** 
     * @param {import(".").Server} server
     * @return {Script[]}
    */
    initPlan(server){
        return []
    }

    /** 
     * @param {Script[]} plan
     * @param {import(".").Server} server
     * @return {import(".").Server}
    */
    applyPlan(plan, server){
        return plan.reduce((acc, cur) => cur.apply(acc), server)
    }

    /**
     * @param {Script[]} plan
     */
    planCost(plan){
        return plan.reduce((acc, cur) => acc + cur.getRam())
    }

    /** 
     * @param {import(".").Server} server
    */
    serverValue(server){
        const h = this.ns.formulas.hacking
        let idealServer = this.ns.getServer(server.hostname)
        idealServer.moneyAvailable = idealServer.moneyMax
        idealServer.hackDifficulty = idealServer.minDifficulty
        let plan = this.plan(idealServer)
        let time = Math.max(
            ...plan.map(script =>
                script.time(idealServer)))
        let threads = plan
            .map(script => script.getRam())
            .reduce((acc, cur) => acc + cur)
        let value = plan
            .filter(script => script.file == "h.js")
            .map(script => script.threads)
            .reduce((acc, cur) => acc + cur)
        // return value / (threads * Math.sqrt(time))
        return value / threads
    }
}

export class FormulasPlanner extends Planner{
    /** 
     * @param {import(".").Server} server
     * @return {Script[]}
    */
    initPlan(server, pct=0.5){
        const player = this.ns.getPlayer()
        const hform = this.ns.formulas.hacking
        let h = (hform.hackPercent(server, player) == 0) ?
            0 : Math.floor(pct / hform.hackPercent(server, player))
        let ret = []
        if (h > 0){
            let script = new HackScript(this.ns, h)
            ret.push(script)
            server = script.apply(server);
        }
        let w = Math.ceil((server.hackDifficulty - server.minDifficulty)/0.05)
        if (w > 0){
            let script = new WeakenScript(this.ns, w)
            ret.push(script)
            server = script.apply(server);
        }
        let g = 1;
        if (server.moneyAvailable == 0){
            g = 1000;
        }
        else{
            g = this.ns.growthAnalyze(server.hostname, server.moneyMax / server.moneyAvailable)
        }
        while ((server.moneyMax / server.moneyAvailable) > hform.growPercent(server, g, player)){
            g++;
        }
        if (g > 0){
            let script = new GrowScript(this.ns, g)
            ret.push(script)
            server = script.apply(server);
        }
        let w2 = Math.ceil((server.hackDifficulty - server.minDifficulty)/0.05)
        if (w2 > 0){
            let script = new WeakenScript(this.ns, w2)
            ret.push(script)
            server = script.apply(server);
        }
        return ret
    }
}

export class IdealPlanner extends Planner{
    /** 
     * @param {import(".").Server} server
     * @return {Script[]}
    */
    initPlan(server){
        const player = this.ns.getPlayer()
        const hform = this.ns.formulas.hacking
        let h = Math.floor(0.5 / hform.hackPercent(server, player))
        let w = Math.ceil(0.002 * (h+1) / 0.05)
        let g = Math.ceil(this.ns.growthAnalyze(server.hostname, 2.1))
        let w2 = Math.ceil((g+1) * 0.004 / 0.05)
        let ret = []
        if (h > 0)
            ret.push(new HackScript(this.ns, h))
        if (w > 0)
            ret.push(new WeakenScript(this.ns, w))
        if (g > 0)
            ret.push(new GrowScript(this.ns, g))
        if (w2 > 0)
            ret.push(new WeakenScript(this.ns, w2))
        return ret
    }
}