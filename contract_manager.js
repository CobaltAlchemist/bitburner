import {explore} from "./explore.js";
export const solutions = {};

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (!(ns.args.includes("debug"))){
        ns.disableLog("ALL");
    }
    while (true){
        //get_targets(ns).forEach( s=>
        let targets = explore(ns)
            .filter(host => 
                ns.ls(host).filter(contractFilter).length)
            
        targets.forEach(host =>
            {
                ns.printf("Host %s", host)
                ns.ls(host).filter(contractFilter)
                    .forEach(file => {
                        let type = ns.codingcontract.getContractType(file, host)
                        let data = ns.codingcontract.getData(file, host)
                        let success = solve_contract(ns, file, host)
                        ns.printf("\tContract %s%s\n\t\t%s\n\t\t%s",
                            file, success ? '+' : '', type, data)
                })
            }
        )
        await ns.sleep(1000);
    }
}

function contractFilter(file){
    return file.match(/.*\.cct/i)
}

/** @param {import(".").NS } ns */
function solve_contract(ns, file, host) {
    let type = ns.codingcontract.getContractType(file, host);
    let data = ns.codingcontract.getData(file, host);
    let desc = ns.codingcontract.getDescription(file, host);
    if (type in solutions){
        let solution = solutions[type](data);
        let success = ns.codingcontract.attempt(solution, file, host);
        if (!success){
            ns.tprint(solution);
            ns.tprintf(
                "Failed contract!\n%s", desc
            )
            throw "A contract solver is incorrect!";
        }
        return success;
    }
}

/**
 * @param {import(".").NS } ns
 * @param {string} file
 * @param {string} host
 * @return {boolean}
 * */
function lrg_prm_fctr(ns, file, host){
    var x = parseInt(ns.codingcontract.getData(file, host));
    return ns.codingcontract.attempt(lrg_prm_fctr_rec(x), file, host);
}

/** @param { number } ns */
function lrg_prm_fctr_rec(x){
    for (let i = 2; i < x / 2; i++){
        if (x % i == 0)
            return Math.max(i, lrg_prm_fctr_rec(x));
    }
    return x;
}

solutions["Array Jumping Game"] = (data) => {
    if (jump(data) > 0)
        return 1
    return 0
};
solutions["Array Jumping Game II"] = (data) => jump(data);
/**
 * @param {number[]} nums
 * @return {number}
 */
function jump(nums) {
    var shortest = nums.map(n => nums.length);
    shortest[nums.length - 1] = 0;
    for (let i = nums.length - 2; i >= 0; i--){
        var minimum = nums.length;
        for (let j = i+1; j <= Math.min(nums.length - 1, i + nums[i]); j++){
            minimum = Math.min(minimum, shortest[j] + 1);
        }
        shortest[i] = minimum;
    }
    if (shortest[0] === nums.length)
        return 0;
    return shortest[0]
};

/**
 * @param {number} dec
 * @return {string}
 */
function int2bin(dec){
    var ret = "";
    for(let i = Math.floor(Math.log2(dec)); i >= 0; i--){
        var val = Math.pow(2, i);
        var one = dec >= val;
        ret += (one ? "1" : "0").toString();
        if (one) dec -= val;
    }
    return ret;
}

/**
 * @param {string} bin
 * @return {string}
 */
function ham(bin){
    var bin_idx = bin.length - 1;
    var paritybits = Math.ceil(Math.log2(bin.length));
    var ret = new Array(paritybits + bin.length + 1);
    for (let i = 0; i < paritybits; i++){
        ret[Math.pow(2, i)] = "0";
    }
    for (let i = paritybits + bin.length; i >= 0; i--){
        if (ret[i] == "0")
            continue;
        ret[i] = bin[bin_idx--];
    }
    // for (let i = paritybits - 1; i >= 0; i--){
    //     var stride = Math.pow(2, i)
    //     var total = 0;
    //     for (let j = 0; j < ret.length; j+= stride){
    //         total += ret[j] == "1"
    //     }
    //     ret[stride] = (total % 2) ? "0" : "1";
    // }
    return ret;
}


solutions["HammingCodes: Encoded Binary to Integer"] = (data) => {
    var bin = unham(data);
    var ret = 0;
    for (let i = 0; i < bin.length; i++){
        if (bin[i] === "1"){
            ret += Math.pow(2, i);
        }
    }
    return ret;
 }
/**
 * @param {string} bin
 * @return {string}
 */
function unham(bin){
    var ret = "";
    var error = 0;
    for (const [idx, elem] of bin.split('').entries()){
        if (elem == "1")
            error ^= idx;
    }
    var j = 4;
    for (let i = 3; i < bin.length; i++) {
        if (i == j){
            j *= 2;
            continue;
        }
        if (i == error) {
            ret += (bin[i] == "0") ? "1" : "0";
            continue;
        }
        ret += bin[i];
    }
    return ret.split("").reverse().join("");
}

solutions["Generate IP Addresses"] = (data) => {
    return "[" + genip_rec(0, data).map(ip => ip.join('.')).join(", ") + "]";
}
/**
 * @param {number} depth
 * @param {string} octet
 * @return {string[][]}
 */
function genip_rec(depth, octet){
    if (octet.length == 0)
        return [[]]
    var ret = []
    for (let i = 1; i <= Math.min(octet.length, 3); i++){
        var mine = octet.slice(0, i);
        var theirs = octet.slice(i);
        if (parseInt(mine) <= 255 && (mine.length == 1 || mine[0] != "0")){
            var options = genip_rec(depth + 1, theirs);
            options.filter(opt => opt.length + depth + 1 == 4)
               .forEach(opt => ret.push([mine, ...opt]));
        }
    }
    return ret;
}

solutions["Find Largest Prime Factor"] = (data) => {
    let val = data
    for (let i = 2; i < val;){
        if (0 == val % i)
            val = val / i
        else
            i++
    }
    return val
}

solutions["Merge Overlapping Intervals"] = (data) => {
    return merge(data).map(arr => "["+arr.join(",")+"]").join(",")
}

/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
    let sorted = intervals.sort((a, b) => a[0] - b[0])
    return sorted.reduce((acc, cur) => {
        let last = (acc.length > 0) ? acc.pop() : undefined
        if (last == undefined)
            return [cur]
        else if (last[1] >= cur[0]){
            acc.push([last[0], Math.max(last[1], cur[1])])
            return acc
        }
        else {
            acc.push(last)
            acc.push(cur)
            return acc
        }
    }, [])
};

solutions["Spiralize Matrix"] = (data) => {
    debugger
    let pos = [0, 0]
    let dir = [0, 1]
    let ret = []
    let left = 0
    let top = 0
    let right = data[0].length
    let bottom = data.length
    for (let i = 0; i < data.length * data[0].length; i++){
        console.log(pos, dir, ret, left, top, right, bottom)
        ret.push(data[pos[0]][pos[1]])
        let next = [pos[0] + dir[0], pos[1] + dir[1]]
        let turn = false
        if (left > next[1]){
            turn = true
            bottom--
            console.log("(left)turn")
        } else if (top > next[0]){
            turn = true
            left++
            console.log("(top)turn")
        } else if (next[0] >= bottom){
            turn = true
            right--
            console.log("(bottom)turn")
        } else if (next[1] >= right){
            turn = true
            top++
            console.log("(right)turn")
        }
        if (turn){
            let temp = dir[0]
            dir[0] = dir[1]
            dir[1] = -temp
            next = [pos[0] + dir[0], pos[1] + dir[1]]
        }
        console.log("\t", pos, dir, ret, left, top, right, bottom)
        pos = next
    }
    return ret.join(",")
}