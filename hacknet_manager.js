/** @param {import(".").NS } ns */
export async function main(ns) {
    while(true){
        var play_money = ns.getServerMoneyAvailable("home") / 100;
        var nodes = ns.hacknet.numNodes();
        if (ns.hacknet.maxNumNodes() > nodes &&
            ns.hacknet.getPurchaseNodeCost() < play_money){
            ns.hacknet.purchaseNode();
            ns.print("Purchasing new hacknet node");
            continue;
        }
        var upgraded = false
        for (let i = 0; i < nodes; i++){
            if (ns.hacknet.getLevelUpgradeCost(i) < play_money){
                ns.printf("Upgrading node %d level", i);
                ns.hacknet.upgradeLevel(i);
                upgraded = true;
                break;
            }
            if (ns.hacknet.getRamUpgradeCost(i) < play_money){
                ns.printf("Upgrading node %d ram", i);
                ns.hacknet.upgradeRam(i);
                upgraded = true;
                break;
            }
            if (ns.hacknet.getCoreUpgradeCost(i) < play_money){
                ns.printf("Upgrading node %d cores", i);
                ns.hacknet.upgradeCore(i);
                upgraded = true;
                break;
            }
        }
        if (!upgraded)
            await ns.sleep(1000);
    }
}