import { Batch } from "./batch";
import { GrowScript, HackScript, WeakenScript } from "./script";
// import {SwarmManager} from "./botnet"
// import { FormulasPlanner } from "./planner";

/** @param {import(".").NS } ns */
export async function main(ns) {
	// let manager = new SwarmManager(ns, true);
	// ns.tprint(manager.servers.map(x => `${x.hostname}, ${x.maxRam}`));
	// ns.tprint(manager.getServerMaxRam());
	// ns.tprint(manager.getServerUsedRam());
	// // ns.tprint(manager.isRunning("hacktargetv2.js", "alpha-ent"))
	// // let scripts = manager.run("h.js", 200000, "alpha-ent")
	// // ns.tprint(scripts)
	// // ns.tprint(manager.isRunningScripts(scripts))
	// let server = ns.getServer("sigma-cosmetics")
	// let planner = new FormulasPlanner(ns, manager)
	// let plan = planner.plan(server)
	// ns.tprintf("Start: %d/%d, %s/%s",
	// 	server.hackDifficulty, server.minDifficulty,
	// 	ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"))
	// server = planner.applyPlan(plan, server)
	// ns.tprintf("End: %d/%d, %s/%s",
	// 	server.hackDifficulty, server.minDifficulty,
	// 	ns.nFormat(server.moneyAvailable, "0.0a"), ns.nFormat(server.moneyMax, "0.0a"))
	let batch = new Batch(ns, 40, 100, 
		new HackScript(ns, 10),
		new GrowScript(ns, 10),
		new WeakenScript(ns, 10))
	print(batch.getActions("iron-gym"))
}