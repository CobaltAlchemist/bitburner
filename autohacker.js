import { explore } from "./explore";

/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("sleep");
    ns.disableLog("scan");
    var all_ports = [
        { file: "BruteSSH.exe", exe: ns.brutessh },
        { file: "FTPCrack.exe", exe: ns.ftpcrack },
        { file: "relaySMTP.exe", exe: ns.relaysmtp },
        { file: "HTTPWorm.exe", exe: ns.httpworm },
        { file: "SQLInject.exe", exe: ns.sqlinject },
    ]
    while(true){
        var nuked = 0;
        var port_openers = all_ports
            .filter(option => ns.fileExists(option.file))
            .map(option => option.exe)

        explore(ns)
            .map(target => ns.getServer(target))
            .filter(server => !server.hasAdminRights && server.numOpenPortsRequired <= port_openers.length)
            .forEach(server => {
                    ns.printf("Nuking %s", server.hostname);
                    port_openers.forEach(opener => opener(server.hostname));
                    ns.nuke(server.hostname);
                    nuked++; })
        if (nuked > 0)
            ns.exec("deploy_hackers.js", ns.getServer().hostname);
        await ns.sleep(5000);
    }
}