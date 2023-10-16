export function formatMoney(ns, money){
    return ns.nFormat(money, "$0.00a")
}

export function formatRam(ns, ram){
    return ns.nFormat(ram, "0.0b")
}