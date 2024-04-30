const { NBTParser } = require("./NBTParser.js")
function getNbtContent(nbttext) {
    if (nbttext === undefined) return undefined;
    if (typeof (nbttext) === 'object') {
        if (Array.isArray(nbttext)) {
            if (nbttext.length >= 1) {
                if (typeof (nbttext[0]) === 'string') {
                    if (nbttext[0].startsWith("B;") || nbttext[0].startsWith("I;") || nbttext[0].startsWith("L;")) {
                        nbttext[0] = nbttext[0].substring(2);
                        for (let i = 0; i < nbttext.length; i++) {
                            nbttext[i] = getNbtContent(nbttext[i]);
                        }
                    }
                }
            }
        }
        return nbttext;
    }
    if (typeof (nbttext) !== 'string') return nbttext;
    if (nbttext.startsWith("\"")) {
        return JSON.parse(nbttext);
    } else if (nbttext.startsWith("'")) {
        return JSON.parse(nbttext.substring(1, nbttext.length - 1));
    }
    switch (nbttext[nbttext.length - 1]) {
        case 's':
        case 'S':
        case 'b':
        case 'B':
            return parseInt(nbttext.substring(0, nbttext.length - 1));
        case 'l':
        case 'L':
            return BigInt(nbttext.substring(0, nbttext.length - 1));
        case 'f':
        case 'F':
        case 'd':
        case 'D':
            return parseFloat(nbttext.substring(0, nbttext.length - 1));
        default:
            return parseFloat(nbttext);
    }
}
function getNbtType(nbttext) {
    if (typeof (nbttext) === 'boolean') return 'boolean';
    if (typeof (nbttext) === 'object') {
        if (Array.isArray(nbttext)) {
            if (nbttext.length >= 1) {
                if (typeof (nbttext[0]) === 'string') {
                    if (nbttext[0].startsWith("B;")) return 'bytearray';
                    if (nbttext[0].startsWith("I;")) return 'intarray';
                    if (nbttext[0].startsWith("L;")) return 'longarray';

                    // || nbttext[0].startsWith("I;") || nbttext[0].startsWith("L;")) {


                }
            }
            return 'list';
        }
        return 'compound';

    }
    if (typeof (nbttext) !== 'string') return nbttext;
    if (nbttext.startsWith("\"")) {
        return 'string';
    } else if (nbttext.startsWith("'")) {
        return 'string';
    }
    switch (nbttext[nbttext.length - 1]) {
        case 'b':
        case 'B':
            return 'byte';
        case 's':
        case 'S':
            return 'short';
        case 'l':
        case 'L':
            return 'long';
        case 'f':
        case 'F':
            return 'float';
        case 'D':
        case 'd':
            return 'float';
        default:
            let intN = parseInt(nbttext);
            let floatN = parseFloat(nbttext);
            if (floatN != nbttext) return 'unknown';
            return (intN == floatN ? 'int' : 'double');
    }
}
function warpComponentValue(key) {
    return key;
}
function warpKey(key) {

    if (typeof key !== 'string')
        throw new SyntaxError("Argument is not a String");
    var regu = /^\w+$/; // From wiki: https://zh.minecraft.wiki/w/NBT%E6%A0%BC%E5%BC%8F
    if (regu.test(key)) {
        return key;
    } else {
        return JSON.stringify(key)
    }
}
const NBTools = {
    Class: {
        NbtObject: class { },
    },
    ToString: function (NbtObject) {
        let result = "";
        let type = getNbtType(NbtObject);
        switch (type) {
            case 'intarray':
            case 'bytearray':
            case 'longarray':
                for (let i in NbtObject) {
                    result += (result == "" ? "" : ",") + NbtObject[i];
                }
                return `[${result}]`;
            case 'string':
                return NbtObject;
            case 'short':
            case 'int':
            case 'long':
            case 'float':
            case 'double':
            case 'byte':
                return NbtObject;
            case 'compound':
                for (let key in NbtObject) {
                    if (NbtObject[key] != undefined)
                        result += (result == "" ? "" : ",") + warpKey(key) + ":" + this.ToString(NbtObject[key]);
                }
                return "{" + result + "}";
            case 'list':
                for (let i in NbtObject) {
                    result += (result == "" ? "" : ",") + this.ToString(NbtObject[i]);
                }
                return "[" + result + "]";
            default:
                return JSON.stringify(NbtObject);
        }
    },
    ParseNBT: function (NbtString) {
        return NBTParser(NbtString)
    }
};

module.exports = { NBTools, getNbtContent, getNbtType, warpKey, warpComponentValue }