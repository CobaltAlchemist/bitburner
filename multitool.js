import { explore } from "./explore"

/** @param {import(".").NS } ns */
export async function main(ns) {
    explore(ns)
        .filter(host => ns.hasRootAccess(host) && ns.getServerMoneyAvailable(host) > 0)
        .sort((a, b) => ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a))
        .forEach(host =>
            ns.tprintf("%s - %s - %s",
                host,
                ns.nFormat(ns.getServerMoneyAvailable(host), "0.0a"),
                ns.getServerRequiredHackingLevel(host)))
}