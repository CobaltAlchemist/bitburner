/** @param {import(".").NS } ns */
export async function main(ns) {
    var cost = ns.getPurchasedServerCost(ns.args[1]);
    var coststr = ns.nFormat(cost, "0.0a");
    if (cost > ns.getServerMoneyAvailable("home")){
        ns.tprintf("Not enough money, need $%s", coststr);
        return;
    }
    var prompt = ns.sprintf("Purchase server for $%s?", coststr);
    var choice = await ns.prompt(prompt, {type: "boolean"});
    if (choice == true) {
        var server = ns.purchaseServer(ns.args[0], ns.args[1]);
        if (server === ns.args[0])
            ns.tprint("Purchased!");
        else
            ns.tprint("Invalid!");
    }
    else{
        return;
    }
}