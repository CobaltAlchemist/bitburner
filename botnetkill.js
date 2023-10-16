import { SwarmManager } from "./botnet";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let sm = new SwarmManager(ns)
    sm.killall()
}