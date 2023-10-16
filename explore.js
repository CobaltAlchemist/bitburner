/**
 * @param {import(".").NS } ns 
 * @param {(host: string, path: string[]) => void} acc_fn
 * @return {string[]}
 * */
export function explore(ns) {
    var hosts = [];
    ns.scan().forEach(host => explore_rec(ns, host, hosts, ["home"]));
    return hosts;
}

/** 
 * @param {import(".").NS } ns 
 * @param {string} host
 * @param {string[]} hosts
 * @param {any[]} acc
 * */
function explore_rec(ns, host, hosts, path) {
    hosts.map
    if (hosts.includes(host) || "home" === host){
        return;
    }
    hosts.push(host)
    ns.scan(host).forEach(next => {
        explore_rec(ns, next, hosts, [...path, host]);
    })
}