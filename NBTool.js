const { NBTParser } = require("./NBTParser.js")
const NBTFILE_LIB = require("./nbtfile_lib.js")
function getNbtContent(nbttext) {
    if (nbttext === undefined) return undefined;
    if (typeof nbttext === 'boolean') return nbttext;
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
        return (nbttext.substring(1, nbttext.length - 1).replaceAll("\\\\", "\\"));
    }
    if (nbttext.length <= 1) return nbttext;

    if (('0' > nbttext[0] || nbttext[0] > '9') && (nbttext[0] != '-' && nbttext[0] != "."))
        return nbttext;

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
            if (nbttext[0] == '.') nbttext = "0" + nbttext;

            // console.log()
            let floatN = parseFloat(nbttext);
            return floatN;
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
    if (typeof (nbttext) !== 'string') return typeof (nbttext);
    if (nbttext.startsWith("\"")) {
        return 'string';
    } else if (nbttext.startsWith("'")) {
        return 'string';
    }
    if (nbttext.length > 2)
        if (('0' > nbttext[0] || nbttext[0] > '9') && nbttext[0] != '-' && nbttext[0] != '.') {
            return 'string';
        }
    if (nbttext[0] == '.') nbttext = "0" + nbttext;
    let intN = null;
    let floatN = null;
    let tempStr = nbttext;
    switch (nbttext[nbttext.length - 1]) {
        case 'b':
        case 'B':
            tempStr = nbttext.substring(0, nbttext.length - 1);
            intN = parseInt(tempStr);
            if (intN != tempStr) return 'string'
            return 'byte';
        case 's':
        case 'S':
            tempStr = nbttext.substring(0, nbttext.length - 1);
            intN = parseInt(tempStr);
            if (intN != tempStr) return 'string'
            return 'short';
        case 'l':
        case 'L':
            tempStr = nbttext.substring(0, nbttext.length - 1);
            intN = parseInt(tempStr);
            if (intN != tempStr) return 'string'
            return 'long';
        case 'f':
        case 'F':
            if (nbttext[0] == '.') nbttext = "0" + nbttext;
            else if (nbttext[0] == '-' && nbttext[1] == '.') nbttext = "-0" + nbttext.substring(1);

            tempStr = nbttext.substring(0, nbttext.length - 1);
            if (tempStr[tempStr.length - 1] == '.') tempStr.substring(0, tempStr.length - 1);
            intN = parseFloat(tempStr);
            if (intN != tempStr) return 'string'
            return 'float';
        case 'D':
        case 'd':
            if (nbttext[0] == '.') nbttext = "0" + nbttext;
            else if (nbttext[0] == '-' && nbttext[1] == '.') nbttext = "-0" + nbttext.substring(1);

            tempStr = nbttext.substring(0, nbttext.length - 1);
            if (tempStr[tempStr.length - 1] == '.') tempStr.substring(0, tempStr.length - 1);
            intN = parseFloat(tempStr);
            if (intN != tempStr) return 'string';
            return 'double';
        default:
            if (nbttext[0] == '.') nbttext = "0" + nbttext;
            intN = parseInt(nbttext);
            floatN = parseFloat(nbttext);
            if (floatN != nbttext) return 'unknown';
            return (intN == floatN ? 'int' : 'double');
    }
}
function warpComponentValue(key) {
    return key;
}
function warpKey(key, isData = false) {
    if (isData) {
        if (key.startsWith('"')) return key;
        if (key.startsWith('\'')) return key;
    }
    if (typeof key !== 'string')
        throw new SyntaxError("Argument is not a String");

    var regu = /^\w+$/; // From wiki: https://zh.minecraft.wiki/w/NBT%E6%A0%BC%E5%BC%8F
    if (key == "true") return '"true"';
    if (key == "false") return '"false"';
    if (/^[0-9-,].*/.test(key)) {
        return JSON.stringify(key)
    } else if (regu.test(key)) {
        return key;
    } else {
        return JSON.stringify(key)
    }
}
function removeNbtTag(dat) {
    if (typeof dat === 'string') return getNbtContent(dat);
    let rootType = getNbtType(dat);
    switch (rootType) {
        case 'intarray':
        case 'bytearray':
        case 'longarray':
            dat = getNbtContent(dat);
    }
    for (let i in dat) {
        if (typeof dat[i] === 'string') {
            try {
                dat[i] = getNbtContent(dat[i]);
            } catch (e) {
            }
        } else if (typeof dat[i] === 'object') {
            removeNbtTag(dat[i]);
        }
    }
}
const NBTools = {
    Class: {
        NbtObject: class { },
    },
    FromMCNBT: function (data) {
        function __pack(data) {
            let root = {};
            function parse_main(dat) {
                let t = dat.getType();
                return parse_body(dat, t);
            }
            function parse_body(dat, t) {
                if (t == 'component') {
                    return parse_component(dat);
                } else if (t == 'byte_array') {
                    return parse_number_list(dat.getValue(), "byte");
                } else if (t == 'int_array') {
                    return parse_number_list(dat.getValue(), "int");
                } else if (t == 'long_array') {
                    return parse_number_list(dat.getValue(), "long");
                } else if (t == 'list') {
                    return parse_list(dat.getValue());
                } else if (t == 'string') {
                    let str = (dat.getValue());
                    return JSON.stringify(str);
                } else {
                    return pack_num(dat);
                }
            }
            function pack_num(dat) {
                let t = dat.getType();
                if (t == 'byte') {
                    return dat.getValue() + "b";
                } else if (t == 'int') {
                    return dat.getValue() + "";
                } else if (t == 'long') {
                    return dat.getValue() + "l";
                } else if (t == 'float') {
                    return dat.getValue() + "f";
                } else if (t == 'double') {
                    return dat.getValue() + "d";
                } else
                    return dat.getValue();
            }
            function parse_number_list(dat, type) {
                let arrLen = dat.length;
                let res = "";
                let prefix = "I";
                if (type == 'byte') {
                    prefix = "B";
                } else if (type == 'int') {
                    prefix = "I";
                } else if (type == 'long') {
                    prefix = "L";
                }
                let arr = new Array();
                for (let i = 0; i < arrLen; i++) {
                    arr[i] = pack_num(dat[i]);
                }
                if (arr[0] != null) {
                    arr[0] = `${prefix};${arr[0]}`;
                } else {
                    arr[0] = `${prefix};`;
                }
                return arr;
            }
            function parse_list(dat) {
                let arrLen = dat.length;
                let arr = new Array();
                for (let i = 0; i < arrLen; i++) {
                    arr[i] = parse_main(dat[i]);
                }
                return arr;
            }
            function parse_component(dat) {
                let __map = dat.getValue();


                let rt = {};
                let count = 0,last_key = null;
                for (let key in __map) {
                    count++;
                    last_key = key;
                    let ele = __map[key];
                    rt[key] = parse_main(ele);
                }
                if(count == 1 && last_key == ""){
                    return rt[last_key];
                };
                return rt;
            }
            root = parse_component(data);
            return root;
        }
        return __pack(data);
    },
    ToMCNBT: function (data) {

    },
    ToJSON: function (NbtObject) {
        let data = NbtObject;
        let obj = removeNbtTag(data);
        if (obj != null) return obj;
        return data;
    },
    ToString: function (NbtObject) {
        let result = "";

        if (NbtObject == null) return null;
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
                return warpKey(NbtObject, true);
            case 'short':
            case 'int':
            case 'long':
            case 'float':
            case 'double':
            case 'byte':
                // console.log(getNbtContent(NbtObject))
                return NbtObject;
            case 'compound':
                for (let key in NbtObject) {
                    // console.log(NbtObject[key]!=undefined)                  
                    if (NbtObject[key] != undefined)
                        result += (result == "" ? "" : ",") + warpKey(key) + ":" + this.ToString(NbtObject[key], true);
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