/** @param {import(".").NS } ns */
export async function main(ns) {
    get_targets(ns).forEach( s=>
        ns.tprint(s)
    )
}

/** @param {import(".").NS } ns */
function get_targets(ns) {
    var hosts = [];
    var files = [];
    ns.scan().forEach(host => explore(ns, host, hosts, files, "home"));
    return files;
}

/** @param {import(".").NS } ns */
function explore(ns, host, hosts, files, path) {
    var server = ns.getServer(host);
    var money = ns.getServerMaxMoney(host);
    var debug = ns.args[0] == "debug";
    if (hosts.includes(host) || "home" === host){
        return;
    }
    ns.ls(host).filter(file =>
        file.match(/.*\.cct/i)).forEach(file =>
            {
                files.push(ns.sprintf("Host: %s, File: %s", path + "," + host, file));
            });
    if (debug){
        ns.tprintf("Host %s, %s", server.hostname, ns.nFormat(money, "0.0a"));
    }
    hosts.push(host)
    ns.scan(host).forEach(next => {
        explore(ns, next, hosts, files, path + "," + host);
    })
}