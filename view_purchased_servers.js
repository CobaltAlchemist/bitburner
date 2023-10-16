/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.getPurchasedServers().map(
        server => ns.getServer(server)
    ).forEach(
        server => ns.tprintf(
            "%s: %s RAM",
            server.hostname,
            ns.nFormat(server.maxRam, "0.0a"))
    )
}