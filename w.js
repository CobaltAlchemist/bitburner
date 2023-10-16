/** @param {import(".").NS } ns */
export async function main(ns) {
	if (ns.args.length >= 2)
		await ns.sleep(ns.args[1]);
	var result = await ns.weaken(ns.args[0]);
	ns.writePort(1, ns.sprintf("weaken,%d", result));
}