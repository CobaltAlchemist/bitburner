/** @param {import(".").NS } ns */
export async function main(ns) {
    var scripts = [
        "autohacker.js",
        "manage_purchased_servers.js",
        "monitor.js",
        "hacknet_manager.js",
        "contract_manager.js",
        "exp_farm.js"
    ]
    scripts.filter(
        script => !ns.isRunning(script, "home")
    ).forEach(
        script => ns.exec(script, "home")
    )
}