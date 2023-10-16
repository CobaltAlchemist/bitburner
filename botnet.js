import { explore } from "./explore"
import { Script } from "./script"

export class ExecutingScript {
    /** @type {number} */
    pid
    /** @type {import(".").Server} */
    server
    /** @type {string} */
    script
    /** @type {(string | number | boolean)[]} */
    args
}

export class SwarmManager {
    /** @type {import(".").NS} */
    ns
    /** @type {import(".").Server[]} */
    servers
    /** @type {boolean} */
    useHome

    /** 
     * @param {import(".").NS } ns
     * @param {boolean} useHome
    */
    constructor(ns, useHome=false){
        this.ns = ns
        this.useHome = useHome
        this.searchServers()
    }

    searchServers(){
        this.servers = explore(this.ns)
            .map(x => this.ns.getServer(x))
            .filter(x => x.hasAdminRights && x.maxRam > 0)
            .sort(this.ramSort)
        if (this.useHome)
            this.servers.push(this.ns.getServer("home"))
    }

    /**
     * @param {import(".").Server} a 
     * @param {import(".").Server} b 
     * @returns {number}
     */
    ramSort(a, b){
        return (b.maxRam - b.ramUsed) - (a.maxRam - a.ramUsed)
    }

    reloadServers(){
        this.servers = this.servers
            .map(s => this.ns.getServer(s.hostname))
            .sort(this.ramSort)
    }

    /**
     * @returns {number}
     */
    getServerMaxRam(){
        return this.servers
            .reduce((acc, cur) => cur.maxRam + acc, 0)
    }

    /**
     * @returns {number}
     */
    getServerUsedRam(){
        return this.servers
            .reduce((acc, cur) => cur.ramUsed + acc, 0)
    }

    /**
     * @param {string} script
     * @returns {number}
     */
    maxThreads(script){
        let scriptRam = this.ns.getScriptRam(script)
        return this.servers
            .map(server => Math.floor((server.maxRam - server.ramUsed) / scriptRam))
            .reduce((acc, cur) => acc + cur)
    }

    /**
     * @param {import(".").FilenameOrPID} script 
     * @param  {(string | number | boolean)[]} args 
     * @returns {boolean}
     */
    isRunning(script, ...args){
        return this.servers
            .reduce((acc, cur) => 
                this.ns.isRunning(script, cur.hostname, ...args) || acc, false)
    }

    /**
     * @param {ExecutingScript[]} eScripts 
     * @returns {boolean}
     */
    isRunningScripts(eScripts){
        return eScripts
            .map(s => this.ns.isRunning(s.pid))
            .reduce((acc, cur) => acc || cur, false)
    }

    killall(){
        return this.servers
            .forEach(server => this.ns.killall(server.hostname))
    }

    /**
     * @param {string} script 
     * @param {number} numThreads 
     * @param  {(string | number | boolean)[]} args 
     * @returns {ExecutingScript[]}
     */
    run(script, numThreads=undefined, ...args){
        if (numThreads <= 0)
            return []
        let plan = this.createPlan(script, numThreads, ...args)
        return this.execPlan(script, plan, ...args)
    }

    /**
     * @param {Script[]} scripts 
     * @returns {ExecutingScript[]}
     */
    runMulti(scripts){
        try{
            let plans = scripts
                .map(script => [script, this.createPlan(script.file, script.threads, ...script.args)])
            if (plans.filter(x => x[1].length == 0).length > 0)
                return []
            return plans.map(x => this.execPlan(x[0].file, x[1], ...x[0].args))
                .reduce((acc, cur) => acc.concat(cur))
        }
        catch (error){
            return []
        }
    }

    /**
     * @param {string} script 
     * @param {number} numThreads 
     * @returns {[string, number][]}
     */
    createPlan(script, numThreads=undefined){
        this.reloadServers()
        var scriptRam = this.ns.getScriptRam(script)
        /** @type {[string, number][]} */
        var plan = []
        while (numThreads > 0){
            var curserv = this.servers.sort(this.ramSort)[0]
            var servthreads = Math.min(numThreads,
                Math.floor((curserv.maxRam - curserv.ramUsed) / scriptRam))
            if (servthreads == 0)
                break
            plan.push([curserv.hostname, servthreads])
            curserv.ramUsed += scriptRam * servthreads
            numThreads -= servthreads
        }
        if (numThreads > 0){
            throw "Not enough ram"
        }
        return plan
    }

    /**
     * @param {string} script 
     * @param  {[string, number][]} plan 
     * @param  {(string | number | boolean)[]} args 
     * @returns {ExecutingScript[]}
     */
    execPlan(script, plan, ...args){
        return plan.map(item =>
            {return {pid: this.ns.exec(script, item[0], item[1], ...args),
                    server: item[0],
                    script: script,
                    args: args}})
    }

    /**
     * @param {string | string[]} files
     * @param {string} source
     * @returns {boolean}
     */
    scp(files, source=undefined){
        return this.servers
            .filter(s => files
                .map(f => !this.ns.fileExists(f, s.hostname))
                .reduce((acc, cur) => acc || cur), false)
            .reduce((acc, cur) =>
                acc && (cur.hostname == "home" || this.ns.scp(files, cur.hostname, source)), true)
    }

    /**
     * @param {string} filename
     * @returns {boolean}
     */
    fileExists(filename, source=undefined){
        return this.servers
            .reduce((acc, cur) =>
                acc && this.ns.fileExists(filename, cur.hostname))
    }
}