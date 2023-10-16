import { SwarmManager } from "./botnet"

/** @param {import(".").NS } ns */
export async function main(ns) {
    while (true){
        let sm = new SwarmManager(ns, true)
        let home = ns.getServer()
        let t = (sm.getServerMaxRam() - sm.getServerUsedRam()) * 0.8 / ns.getScriptRam("w.js")
        let scripts = sm.run("w.js", t, "joesguns")
        while (sm.isRunningScripts(scripts)){
            await ns.sleep(100)
        }
        await ns.sleep(10)
    }
}