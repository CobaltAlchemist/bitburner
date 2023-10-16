import { Script } from "./script"

export class DelayedScript{
    /** @type {Script} */
    script
    /** @type {number} */
    delay

    /**
     * @param {Script} script
     * @param {number} delay
     */
    constructor(script, delay){
        this.script = script
        this.delay = delay
    }
}

export class Batch{
    /** @type {import(".").NS} */
    ns
    /** @type {number} */
    actionSpacer
    /** @type {number} */
    batchSpacer
    /** @type {Script[]} */
    actions

    /**
     * @param {import(".").NS} ns
     * @param {number} actionSpacer
     * @param {number} batchSpacer
     * @param {Script[]} scripts
     */
    constructor(ns, actionSpacer, batchSpacer, ...scripts){
        this.actions = scripts
        this.ns = ns
        this.actionSpacer = actionSpacer
        this.batchSpacer = batchSpacer
    }

    /** @returns {number} */
    payWindow(){
        return Math.min(0, this.actions.length - 1) * this.actionSpacer
    }

    /**
     * @param {import(".").Server} target 
     * @returns {number}
     */
    batchTime(target){
        return this.getActions(target)
            .map(ba => ba.delay + ba.script.time(target))
            .reduce(Math.max)
    }

    /** @returns {number} */
    concurrentBatches(target){
        let bTime = this.batchTime(target)
        let fullTime = bTime + this.batchSpacer
        return Math.floor(fullTime / (this.batchSpacer + this.payWindow()))
    }

    /** @returns {number} */
    batchDelay(){
        return this.payWindow() + this.batchSpacer
    }

    /**
     * @param {import(".").Server} target 
     * @returns {DelayedScript[]}
     */
    getActions(target){
        let simTarget = this.ns.getServer(target.hostname)
        let times = this.actions
            .map((action, i, _) => {
                let time = action.time(simTarget)
                action.apply(simTarget)
                return time - i * this.actionSpacer
            })
        let waitTime = times
            .reduce((acc, cur) => Math.max(acc, cur), times[0])
        return this.actions
            .map((action, i) => new DelayedScript(action, waitTime - times[i]))
    }
}