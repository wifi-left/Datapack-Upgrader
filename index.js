(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const ERROR_MESSAGES = {
    NOT_ENOUGHT_ARGUMENTS: "# SyntaxError: Not enough command parameters.",
    UNKNOWN_ARGUMENTS: "# SyntaxError: Unknown command parameters.",
    UNSUPPORTED:"## WARNING: Unsupport transformation",
    WARNING_MAY_CAUSE_PROBLEM: "## WARNING: The transformation may cause problem. You might need to modify it by yourself."
}
module.exports = { ERROR_MESSAGES }

},{}],2:[function(require,module,exports){
// Author: wifi_left

const { writeDebugLine } = require("./inputSystem");

// 灵感来源自：https://zhuanlan.zhihu.com/p/107344979
function NBTParser(str) {
    let i = 0;
    function parseValue() {
        skipWhitespace();
        if (str[i] == '[') {
            // Array
            return parseArray();
        } else if (str[i] == '{') {
            // Array
            return parseObject();
        } else {
            return parseString();
        }
    }
    function skipWhitespace() {
        while (str[i] == ' ' || str[i] == '\n' || str[i] == '\r') i++;
    }
    function eatComma() {
        if (str[i] !== ',') {
            throw new SyntaxError('Expected "," but only found "' + str[i] + '" at ' + i);
        }
        i++;
    }
    function eatColon() {
        if (str[i] !== ':') {
            throw new SyntaxError('Expected ":" but only found "' + str[i] + '" at ' + i);
        }
        i++;
    }
    function parseString() {
        let escapeLock = false; // '\'
        let topElement = -1; // -1 for none, 0 for "", 1 for ''
        let StringBuffer = "";
        while (true) {
            if (topElement == -1) {
                if (str[i] === '}' || str[i] === ']' || str[i] === ',' || str[i] === ':') {
                    break;
                }
                if (i >= str.length) {
                    throw new SyntaxError('Unexpected ends of string.');
                }
                if (str[i] == '"') {
                    if (StringBuffer !== "") {
                        throw new SyntaxError("Unexpected '\"' at " + i);
                    }
                    topElement = 0;
                } else if (str[i] == '\'') {
                    if (StringBuffer !== "") {
                        throw new SyntaxError("Unexpected \"'\" at " + i);
                    }
                    topElement = 1;
                }
                StringBuffer = StringBuffer + str[i];

            } else if (topElement == 0) {
                if (str[i] == '"' && !escapeLock) {
                    StringBuffer = StringBuffer + str[i];
                    i++;
                    return StringBuffer;
                }
                if (escapeLock) {
                    escapeLock = false;
                } else if (str[i] == '\\') {
                    escapeLock = true;
                }
                StringBuffer = StringBuffer + str[i];

            } else if (topElement == 1) {
                if (str[i] == '\'' && !escapeLock) {
                    StringBuffer = StringBuffer + str[i];
                    i++;
                    return StringBuffer;
                }
                if (escapeLock) {
                    escapeLock = false;
                } else if (str[i] == '\\') {
                    escapeLock = true;
                }
                StringBuffer = StringBuffer + str[i];

            }
            i++;
        }
        if (StringBuffer === 'true') StringBuffer = true;
        else if (StringBuffer === 'false') StringBuffer = false;
        return StringBuffer;
    }
    function parseObject() {
        if (str[i] === '{') {
            i++;
            skipWhitespace();

            // if it is not '}',
            // we take the path of string -> whitespace -> ':' -> value -> ...
            let initial = true;
            // if it is not '}',
            let map = {}
            // we take the path of string -> whitespace -> ':' -> value -> ...
            while (str[i] !== '}') {
                if (i >= str.length) {
                    throw new SyntaxError("Expected '}' at " + i + " (End)");
                }
                if (!initial) {
                    eatComma();
                    skipWhitespace();
                }
                let key = parseString();
                if (key === "" && str[i] === '}') break;
                if (key.startsWith('"')) {
                    try {
                        key = JSON.parse(key);
                    } catch (e) {
                        writeDebugLine("Key: " + key + "; catch: " + e.message);

                        throw new SyntaxError("Expected '\"' at " + i + " (End)");
                    }
                }
                skipWhitespace();
                eatColon();
                const value = parseValue();
                if (value === "") {
                    throw new SyntaxError("Unexpected: value of key '" + key + "' is null.");
                }
                initial = false;
                map[key] = value;
            }
            // move to the next character of '}'
            i++;
            return map;
        }
    }
    function parseArray() {
        if (str[i] === '[') {
            i++;
            skipWhitespace();

            // if it is not '}',
            // we take the path of string -> whitespace -> ':' -> value -> ...
            let initial = true;
            // if it is not '}',
            let map = []
            // we take the path of string -> whitespace -> ':' -> value -> ...
            while (str[i] !== ']') {
                if (i >= str.length) {
                    throw new SyntaxError("Expected ']' at " + i + " (End)");
                }
                if (!initial) {
                    eatComma();
                    skipWhitespace();
                }
                const value = parseValue();
                skipWhitespace();

                initial = false;
                if (value === "") continue;
                map.push(value);
            }
            // move to the next character of '}'
            i++;
            return map;
        }
    }
    if (str[i] === '{') {
        return parseObject();
    } else if (str[i] === '[') {
        return parseArray();
    } else {
        if (str == "") return str;
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    }
}
module.exports = { NBTParser }

},{"./inputSystem":5}],3:[function(require,module,exports){
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
        return (nbttext.substring(1, nbttext.length - 1).replaceAll("\\\\", "\\"));
    }
    if (nbttext.length <= 1) return nbttext;

    if ('0' > nbttext[0] || nbttext[0] > '9')
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
        if ('0' > nbttext[0] || nbttext[0] > '9') {
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
function warpKey(key, isData = false) {
    if (isData) {
        if (key.startsWith('"')) return key;
        if (key.startsWith('\'')) return key;
    }
    if (typeof key !== 'string')
        throw new SyntaxError("Argument is not a String");
    if (key.length <= 1) {
        return JSON.stringify(key)
    }
    var regu = /^\w+$/; // From wiki: https://zh.minecraft.wiki/w/NBT%E6%A0%BC%E5%BC%8F
    if (regu.test(key)) {
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
    ToJSON: function (NbtObject) {
        let data = NbtObject;
        let obj = removeNbtTag(data);
        if (obj != null) return obj;
        return data;
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
                return warpKey(NbtObject, true);
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
},{"./NBTParser.js":2}],4:[function(require,module,exports){
const transformation_1_20 = require("./transformations/transformation_1_20.js");
const transformation_1_21_4 = require("./transformations/transformation_1_21_4.js");
const package = require("./package.json")
const chestNbtTool = require("./tools/chestdatatoitemcmd/utils.js");
const { writeDebugLine, writeLine } = require("./inputSystem.js");

var transform_version = "1.20";
document.getElementById("process_1").onclick = function () {
    processText(1);
}
document.getElementById("process_2").onclick = function () {
    processText(0);
}
document.getElementById("process_3").onclick = function () {
    processText(2);
}
function processText(type) {
    if (type==0) {
        document.getElementById("output").innerText = "# Type: 1.21.4->1.21.5";
        transform_version = "1.21.4";
    } else if(type == 1) {
        document.getElementById("output").innerText = "# Type: 1.20.4->1.21";
        transform_version = "1.20";
    }else if(type == 2){
        document.getElementById("output").innerText = "# Type: Chest NBT->/item replace";
        transform_version = "chest_nbt";
    }
    writeLine("##")
    writeLine("## Datapack Upgrader v" + package.version + " by " + package.author)
    writeLine("## If you encounter a problem, make an issue on " + package.homepage)
    writeLine("## ")
    const input = document.getElementById('input').value;
    const lines = input.split(/\r?\n/);
    const outputDiv = document.getElementById('output');
    for (let i = 0; i < lines.length; i++) {
        writeLine(transformCommand(transform_version, lines[i]));
    }
}

function transformCommand(transform_version, cmd) {
    if (transform_version == "1.20") {
        return transformation_1_20.transformCommand(cmd);
    } else if (transform_version == "1.21.4") {
        return transformation_1_21_4.transformCommand(cmd);
    }else if(transform_version == "chest_nbt"){
        return chestNbtTool.chestDataToItemCmd(cmd);
    }
    return cmd;
}
document.getElementById("package-info").innerHTML = "v" + package.version + " by " + package.author + "<br/>Download CLI version and report bugs on <a target='_blank' href='" + package.homepage+"'>GitHub</a>";


},{"./inputSystem.js":5,"./package.json":7,"./tools/chestdatatoitemcmd/utils.js":8,"./transformations/transformation_1_20.js":9,"./transformations/transformation_1_21_4.js":10}],5:[function(require,module,exports){

var Settings = {
    OutputFile: null,
    OutputFilePath: "",
    debugMode: false,
    jsonMode: false,
    warningMessages: ""
};
const outputObj = document.getElementById("output")
const debugObj = document.getElementById("debug")
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        outputObj.innerText += "\n" + lines[i];
    }
}
function writeDebugLine(...lines) {
    if (!Settings.debugMode) return;
    for (let i = 0; i < lines.length; i++) {
        console.debug(lines[i])
        debugObj.innerText += "\n" + lines[i];

    }
}

module.exports = { writeDebugLine, writeLine, Settings }

},{}],6:[function(require,module,exports){
const NBTools = require("./NBTool.js").NBTools;
const { warpComponentValue } = require("./NBTool.js");
function parseCommand(cmd) {
    if (cmd.startsWith("#")) return [cmd];
    if (typeof (cmd) != "string") throw SyntaxError("Not a String object!");
    return splitText(cmd, " ");
}
function defaultOrValue(item, defaultValue = undefined) {
    if (defaultValue == undefined) defaultValue = "";
    if (item == undefined) return defaultValue;
    return item;
}
function deleteNameSpace(name) {
    if (name == undefined) return "";
    if (name.startsWith("minecraft:")) return name.substring("minecraft:".length);
    return name;
}
function splitText(text, separator) {
    var stack = [];
    var tempStr = '';
    var cmds = [];
    var fanXieGang = 0;
    let quoteMode = false;

    for (var i = 0; i < text.length; i++) {
        if (quoteMode) {
            if (text[i] == "\"" && !fanXieGang && stack[stack.length - 1] == "\"") {
                tempStr += text[i];
                stack.pop();
                quoteMode = false;
            } else if (text[i] == "'" && !fanXieGang && stack[stack.length - 1] == "'") {
                tempStr += text[i];
                stack.pop();
                quoteMode = false;
            } else {
                tempStr += text[i];
            }
        } else {
            if (text[i] == separator && stack.length <= 0) {
                cmds.push(tempStr);
                tempStr = '';
            } else if (text[i] == "\"" && fanXieGang == 0) {
                tempStr += text[i];
                quoteMode = true;
                stack.push("\"");
            } else if (text[i] == "'" && fanXieGang == 0) {
                tempStr += text[i];
                quoteMode = true;
                stack.push("'");
            } else if (text[i] == '[') {
                tempStr += text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('[');
            } else if (text[i] == '{') {
                tempStr += text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('{');
            } else if (text[i] == ']') {
                if (stack[stack.length - 1] == '[') { tempStr += text[i]; stack.pop(); }
                else {
                    throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
                }
            } else if (text[i] == '}') {
                if (stack[stack.length - 1] == '{') { tempStr += text[i]; stack.pop(); }
                else throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
            } else {
                tempStr += text[i];
            }

        }
        if (fanXieGang) fanXieGang = 0;
        else if (text[i] == '\\') {
            fanXieGang = 1;
        }
    }
    if (stack.length > 0) {
        throw SyntaxError("Missing or surplusing '" + stack[0] + "' in " + (text.length - 1));
    }
    if (fanXieGang > 0) {
        throw SyntaxError("Escape error.");
    }
    cmds.push(tempStr);
    return cmds;
}
function parseValues(text, separator, equalsChar, array = false, valueAsNbt = false) {
    var stack = [];
    var tempStr = '';
    var cmds = {};
    if (array) {
        cmds = [];
    }
    let keyName = '';
    var fanXieGang = 0;
    let quoteMode = false;

    for (var i = 0; i < text.length; i++) {
        if (quoteMode) {
            if (text[i] == "\"" && !fanXieGang && stack[stack.length - 1] == "\"") {
                tempStr += text[i];
                stack.pop();
                quoteMode = false;
            } else if (text[i] == "'" && !fanXieGang && stack[stack.length - 1] == "'") {
                tempStr += text[i];
                stack.pop();
                quoteMode = false;
            } else {
                tempStr += text[i];
            }
        } else {
            if (equalsChar.indexOf(text[i])!=-1 && fanXieGang == 0 && stack.length <= 0) {
                keyName = tempStr;
                if (keyName == '') {
                    throw SyntaxError("Empty keyName.");
                }
                tempStr = '';
            } else if (text[i] == separator && fanXieGang == 0 && stack.length <= 0) {
                if (keyName != '') {
                    if (!array)
                        cmds[keyName] = tempStr;
                    else cmds.push({ key: keyName, value: tempStr });
                } else {
                    throw SyntaxError("Empty keyName.");
                }
                tempStr = '';
            } else if (text[i] == "\"" && fanXieGang == 0) {
                tempStr += text[i];
                quoteMode = true;
                stack.push("\"");
            } else if (text[i] == "'" && fanXieGang == 0) {
                tempStr += text[i];
                quoteMode = true;
                stack.push("'");
            } else if (text[i] == '[') {
                tempStr += text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('[');
            } else if (text[i] == '{') {
                tempStr += text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('{');
            } else if (text[i] == ']') {
                if (stack[stack.length - 1] == '[') { tempStr += text[i]; stack.pop(); }
                else {
                    throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
                }
            } else if (text[i] == '}') {
                if (stack[stack.length - 1] == '{') { tempStr += text[i]; stack.pop(); }
                else throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
            } else {
                tempStr += text[i];
            }

        }
        if (fanXieGang) fanXieGang = 0;
        else if (text[i] == '\\') {
            fanXieGang = 1;
        }
    }
    if (stack.length > 0) {
        throw SyntaxError("Missing '" + stack[0] + "' in " + (text.length - 1));
    }
    if (fanXieGang > 0) {
        throw SyntaxError("Escape error.");
    }
    if (keyName != '') {
        if (!array)
            cmds[keyName] = tempStr;
        else cmds.push({ key: keyName, value: tempStr });
    }
    if (valueAsNbt) {
        for (let i in cmds) {
            cmds[i] = NBTools.ParseNBT(cmds[i]);
            // console.log(cmds[i])
        }
    }
    return cmds;
}
function splitTagAndComponents(text) {
    if (text.startsWith("{")) return { tags: text, components: undefined };
    var stack = [];
    var tempStr = '';
    var tags = "";
    var components = "";
    var fanXieGang = 0;
    let quoteMode = false;

    for (var i = 0; i < text.length; i++) {
        if (quoteMode) {
            if (text[i] == "\"" && !fanXieGang && stack[stack.length - 1] == "\"") {
                tempStr += text[i];
                stack.pop();
                quoteMode = false;
            } else if (text[i] == "'" && !fanXieGang && stack[stack.length - 1] == "'") {
                tempStr += text[i];
                stack.pop();
                quoteMode = false;
            } else {
                tempStr += text[i];
            }
        } else {
            if (text[i] == "\"" && fanXieGang == 0) {
                tempStr += text[i];
                quoteMode = true;
                stack.push("\"");
            } else if (text[i] == "'" && fanXieGang == 0) {
                tempStr += text[i];
                quoteMode = true;
                stack.push("'");
            } else if (text[i] == '[') {
                tempStr += text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('[');
            } else if (text[i] == '{') {
                tempStr += text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('{');
            } else if (text[i] == ']') {
                if (stack[stack.length - 1] == '[') { tempStr += text[i]; stack.pop(); }
                else {
                    throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
                }
                if (stack.length == 0) {
                    components = tempStr;
                    tempStr = '';
                }
            } else if (text[i] == '}') {
                if (stack[stack.length - 1] == '{') { tempStr += text[i]; stack.pop(); }
                else throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
            } else {
                tempStr += text[i];
            }

        }
        if (fanXieGang) fanXieGang = 0;
        else if (text[i] == '\\') {
            fanXieGang = 1;
        }
    }

    if (stack.length > 0) {
        throw SyntaxError("Missing '" + stack[0] + "' in " + (text.length - 1));
    }
    if (fanXieGang > 0) {
        throw SyntaxError("Escape error.");
    }
    tags = tempStr;
    return { tags: tags, components: components };
}
function parseSelectorArg(selector) {
    let idx = selector.indexOf("[");
    if (idx == -1) return { player: selector };
    let idy = selector.lastIndexOf("]");
    let target = selector.substring(0, idx);
    let tag = selector.substring(idx + 1, idy);
    let tags = parseValues(tag, ",", "=", true);

    return { player: target, components: tags }
}
function parseItemArg(item) {
    let idxNbt = item.indexOf("{");
    let idx = item.indexOf("[");
    let itemId = item;
    if (idxNbt == -1 && idx == -1) return { id: item };
    if (idx != -1 && (idx < idxNbt || item.endsWith("]"))) {
        itemId = item.substring(0, idx);
    } else {
        itemId = item.substring(0, idxNbt);
    }
    // 分离tag和components
    if (idx == -1 || (idx > idxNbt && item.endsWith("}"))) idx = idxNbt;
    let tagAndComponent = item.substring(idx);
    let tAcs = splitTagAndComponents(tagAndComponent);
    // console.log(tAcs.components)
    return { id: itemId, components: parseComponents(tAcs.components), tags: NBTools.ParseNBT(tAcs.tags) }
}
function parseEntityArg(entity) {
    let idxNbt = entity.indexOf("{");

    let itemId = entity;
    if (idxNbt == -1) return { id: entity };

    itemId = entity.substring(0, idxNbt);
    // 分离tag
    let tags = item.substring(idx);
    return { id: itemId, tags: NBTools.ParseNBT(tags) }
}
function parseBlockArg(Block) {
    let idxNbt = Block.indexOf("{");
    let idx = Block.indexOf("[");
    let itemId = Block;
    if (idxNbt == -1 && idx == -1) return { id: Block };
    if (idx != -1 && (idx < idxNbt || Block.endsWith("]"))) {
        itemId = Block.substring(0, idx);
    } else {
        itemId = Block.substring(0, idxNbt);
    }
    // 分离tag和components
    if (idx == -1 || (idx > idxNbt && Block.endsWith("}"))) idx = idxNbt;
    let tagAndComponent = Block.substring(idx);
    let tAcs = splitTagAndComponents(tagAndComponent);
    return { id: itemId, components: parseComponents(tAcs.components), tags: NBTools.ParseNBT(tAcs.tags) }
}
function parseComponents(components) {
    if (components == "" || components == null) return null;
    if (components.startsWith("[") && components.endsWith("]")) {
        components = (components.substring(1, components.length - 1));
    }
    // console.log(components)
    return parseValues(components, ",", ["=","~"], false, true);
}
function toSelectorText(selectorObj, splitChar = '=') {
    let id = selectorObj.player;
    let components = "";
    if (selectorObj.components != null) {
        if (Array.isArray(selectorObj.components)) {
            for (let i in selectorObj.components) {
                let key = selectorObj.components[i].key;
                let b = selectorObj.components[i].value;
                if (typeof b === 'object')
                    components += (components == "" ? "" : ",") + `${key}${splitChar}${NBTools.ToString(b)}`;
                else components += (components == "" ? "" : ",") + `${key}${splitChar}${warpComponentValue(b)}`;
            }
        } else {
            for (let key in selectorObj.components) {
                let b = selectorObj.components[key];
                if (typeof b === 'object')
                    components += (components == "" ? "" : ",") + `${key}${splitChar}${NBTools.ToString(selectorObj.components[key])}`;
                else components += (components == "" ? "" : ",") + `${key}${splitChar}${warpComponentValue(selectorObj.components[key])}`;
            }
        }

        components = `[${components}]`
    }

    let result = `${id}${components}`;
    return result;
}
function toItemText(itemObj, splitChar = '=') {
    let id = itemObj.id;
    let components = "";
    let tag = "";
    if (itemObj.tags != undefined) {
        tag = NBTools.ToString(itemObj.tags);
    }
    if (itemObj.components != null) {
        for (let key in itemObj.components) {
            components += (components == "" ? "" : ",") + `${key}${splitChar}${NBTools.ToString(itemObj.components[key])}`;
        }
        components = `[${components}]`
    }

    let result = `${id}${components}${tag}`;
    return result;
}




module.exports = { parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues, parseComponents, toItemText, deleteNameSpace, defaultOrValue, toSelectorText }

},{"./NBTool.js":3}],7:[function(require,module,exports){
module.exports={
  "name": "datapackupdater",
  "version": "1.0.3",
  "description": "Upgrade your datapack from older version to newwer version",
  "main": "index.js",
  "scripts": {
    "test": "npm install && node index.js -debug -i sample debug -y",
    "test2": "node index.js -debug -v 1.21.4 -i \"sample/functions\" \"debug/functions\" -y",
    "run": "node index.js",
    "help": "node index.js -h",
    "debug": "node index.js -debug",
    "build_web": "sh ./build_web.sh"
  },
  "bin": {
    "mccmdupdater": "./index.js"
  },
  "files": [
    "*.js"
  ],
  "author": "wifi_left",
  "license": "ISC",
  "homepage": "https://github.com/wifi-left/Datapack-Upgrader",
  "dependencies": {
    "readline-sync": "^1.4.10"
  }
}
},{}],8:[function(require,module,exports){
const { NBTools, getNbtContent } = require("../../NBTool.js")
const { toItemText } = require("../../mccommand.js")
try {
    function chestDataToItemCmd(inputNBT) {
        data = NBTools.ParseNBT(inputNBT);
        let res = ``;
        if(data.Items == null){
            return "";
        }
        for (let i = 0; i < data.Items.length; i++) {
            let it = data.Items[i];
            let Iid = getNbtContent(it.id);
            let Icount = getNbtContent(it.count);
            let Islot = getNbtContent(it.Slot);
            let Icomponents = it.components;
            if (Islot == null) continue
            if (Icount == null) Icount = 1;
            if (Icomponents == null) Icomponents = {};
            let ItemObj = {
                id: Iid,
                components: Icomponents
            };
            res += (res == "" ? "" : "\r\n") + `item replace block ~ ~ ~ container.${Islot} with ${toItemText(ItemObj)} ${Icount}`.trim()
        }
        return res;
    }
} catch (e) {
    return "## Error: " + e.message;
}


module.exports = { chestDataToItemCmd }

},{"../../NBTool.js":3,"../../mccommand.js":6}],9:[function(require,module,exports){
const { writeLine, writeDebugLine } = require("../inputSystem.js");
const { ERROR_MESSAGES } = require("../ErrorMessages.js");
const { defaultOrValue, parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, toItemText, deleteNameSpace, toSelectorText } = require("../mccommand.js");
const { NBTools, getNbtContent, warpKey } = require("../NBTool.js");

const ENCHANTMENTS_TRANSFORMATION = { "sweeping": "sweeping_edge", "minecraft:sweeping": "minecraft:sweeping_edge" }
const ARRTIBUTEOPERATION_TRANSFORMATION = { "0": "add_value", "1": "add_multiplied_base", "2": "add_multiplied_total" }
const FIREWORK_TRANSFORMATION = { "0": "small_ball", "1": "large_ball", "2": "star", "3": "creeper", "4": "burst" }
const FLAGSCOLOR_TRANSFORMATION = { "0": "white", "1": "orange", "2": "magenta", "3": "light_blue", "4": "yellow", "5": "lime", "6": "pink", "7": "gray", "8": "light_gray", "9": "cyan", "10": "purple", "11": "blue", "12": "brown", "13": "green", "14": "red", "15": "black" }
const ITEMSLOT_TRANSFORMATION = { "horse.armor": "armor.body" }
const MAP_TRANSFORMATION = {
    "0": "player", "1": "frame", "2": "red_marker", "3": "blue_marker", "4": "target_x", "5": "target_point", "6": "player_off_map", "7": "player_off_limits", "8": "mansion", "9": "monument", "10": "banner_white", "11": "banner_orange", "12": "banner_magenta", "13": "banner_light_blue", "14": "banner_yellow", "15": "banner_lime", "16": "banner_pink", "17": "banner_gray", "18": "banner_light_gray", "19": "banner_cyan", "20": "banner_purple", "21": "banner_blue", "22": "banner_brown", "23": "banner_green", "24": "banner_red", "25": "banner_black", "26": "red_x", "27": "village_desert", "28": "village_plains", "29": "village_savanna", "30": "village_snowy", "31": "village_taiga", "32": "jungle_temple", "33": "swamp_hut"
}
const BANNERCOLLOR_TRANSFORMATION = {
    "0": "white", "1": "orange", "2": "magenta", "3": "light_blue", "4": "yellow", "5": "lime", "6": "pink", "7": "gray", "8": "light_gray", "9": "cyan", "10": "purple", "11": "blue", "12": "brown", "13": "green", "14": "red", "15": "black"
};
const BANNERNAME_TRANSFORMATION = {
    "b": "base", "bs": "stripe_bottom", "ts": "stripe_top", "ls": "stripe_left", "rs": "stripe_right", "cs": "stripe_center", "ms": "stripe_middle", "drs": "stripe_downright", "dls": "stripe_downleft", "ss": "small_stripes", "cr": "cross", "sc": "straight_cross", "ld": "diagonal_left", "rud": "diagonal_right", "lud": "diagonal_up_left", "rd": "diagonal_up_right", "vh": "half_vertical", "vhr": "half_vertical_right", "hh": "half_horizontal", "hhb": "half_horizontal_bottom", "bl": "square_bottom_left", "br": "square_bottom_right", "tl": "square_top_left", "tr": "square_top_right", "bt": "triangle_bottom", "tt": "triangle_top", "bts": "triangles_bottom", "tts": "triangles_top", "mc": "circle", "mr": "rhombus", "bo": "border", "cbo": "curly_border", "bri": "bricks", "gra": "gradient", "gru": "gradient_up", "cre": "creeper", "sku": "skull", "flo": "flower", "moj": "mojang", "glb": "globe", "pig": "piglin", "flw": "flow", "gus": "guster"
}
const DATAPATH_TRANSFORMATION = [];
function transformId(array, id) {
    let res = array[id];
    if (res == undefined || res == "") return id;
    return res;
}

function transformBannerPatterns(banner) {
    let result = [];
    for (let i in banner) {
        let ele = banner[i];
        let color = transformId(BANNERCOLLOR_TRANSFORMATION, getNbtContent(ele['Color']));
        let pattern = "minecraft:" + transformId(BANNERNAME_TRANSFORMATION, getNbtContent(ele['Pattern']));
        result.push({ color: color, pattern: pattern })
    }
    return result;
}
function modifyLootTableTree(data) {
    for (let i in data) {
        if (i === 'functions') {
            let itemid = data['name'];
            if (itemid == null) itemid = "air";
            else itemid = itemid + "";
            for (let j in data[i]) {
                let functionType = data[i][j]['function'];
                if (deleteNameSpace(functionType) == 'set_nbt') {
                    data[i][j]['function'] = "set_components"
                    let nbt = data[i][j]['tag'];
                    try {
                        let components = transformItemTags(NBTools.ParseNBT(nbt), itemid);
                        data[i][j]['components'] = {}
                        for (let k in components) {
                            data[i][j]['components']["minecraft:" + k] = NBTools.ToJSON(components[k]);

                        }
                        delete data[i][j]['tag'];
                    } catch (e) {
                        writeDebugLine(e);
                    }

                }
            }
        } else {
            if (typeof data[i] === 'object')
                modifyLootTableTree(data[i]);
        }
    }
}
function transformJSON(data) {
    try {
        let dat = JSON.parse(data);
        if (dat['pools'] != null) {
            modifyLootTableTree(dat['pools']);
            return JSON.stringify(dat, null, "    ");
        } else {
            return data;
        }
    } catch (e) {
        writeDebugLine(e);
    }
    return data;
}


function toNbtTextFromPathAndData(path, data = "") {
    let text = path;
    let pathStack = [];
    var stack = [];
    var tempStr = '';
    var fanXieGang = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] == "\"" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "\"") stack.pop()
            else stack.push("\"");
        } else if (stack[stack.length - 1] != '"' && stack[stack.length - 1] != "'") {
            if (text[i] == '[') {
                pathStack.push(tempStr)
                tempStr = text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('[');
            } else if (text[i] == ']') {
                if (stack[stack.length - 1] == '[') { tempStr += text[i]; pathStack.push(tempStr); tempStr = ""; stack.pop(); }
                else {
                    throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
                }
            } else if (text[i] == '.') {
                if (tempStr != "") {
                    pathStack.push(tempStr);
                    tempStr = "";
                    stack.pop();
                }
            } else {
                tempStr += text[i];
            }
        } else {
            tempStr += text[i];
        }
        if (fanXieGang) fanXieGang = 0;
        else if (text[i] == '\\') {
            fanXieGang = 1;
        }
    }
    if (stack.length > 0) {
        throw SyntaxError("Missing '" + stack[0] + "' in " + (text.length - 1));
    }
    if (fanXieGang > 0) {
        throw SyntaxError("Escape error.");
    }
    if (tempStr != '') {
        pathStack.push(tempStr);
    }
    let resObj = {};
    if (pathStack.length >= 1) {
        resObj = data;
        for (let i = pathStack.length - 1; i >= 0; i--) {
            let kname = pathStack[i];
            let newobj = JSON.parse(JSON.stringify(resObj));
            if (kname.startsWith('[')) {
                kname = JSON.parse(kname);
                let arr = [];
                arr[kname[0]] = newobj;
                resObj = arr;
            } else {
                if (kname.startsWith('"')) {
                    kname = JSON.parse(kname);
                }
                resObj = {};
                resObj[kname] = newobj;
            }

        }
        return resObj;
    } else return data;

}
function getNbtPathAndContent(nbt) {

    let path = "", data;
    let nbtCache = nbt;
    if (typeof nbt === 'object') {
        let flag = true;
        while (nbtCache != undefined && flag) {

            flag = false;
            let keyTmp = "";
            if (typeof nbtCache !== 'object') break;
            if (Array.isArray(nbtCache)) {
                for (let i = 0; i < nbtCache.length; i++) {
                    if (nbtCache[i] != undefined && flag) {
                        flag = false;
                        break;
                    } else if (nbtCache[i] != undefined) {
                        keyTmp = i;
                        flag = true;
                    }
                }
                if (flag) {
                    path = path + "[" + keyTmp + "]";
                    nbtCache = nbtCache[keyTmp];

                } else {
                    break;
                }
            } else {
                for (let key in nbtCache) {
                    if (nbtCache[key] != undefined && flag) {
                        flag = false;
                        break;
                    } else if (nbtCache[key] != undefined) {
                        keyTmp = (key);
                        flag = true;
                    }

                }
                if (flag) {
                    path = path + "." + warpKey(keyTmp);
                    nbtCache = nbtCache[keyTmp];
                } else {
                    break;
                }
            }
        }
        if (nbtCache != undefined) {
            data = nbtCache;
        }
        try {
            return { path: path, data: NBTools.ToString(data) };

        } catch (e) {
            writeDebugLine(e);
            return { path: path, data: data };

        }
    } else {
        return nbt;
    }
}
function transformDataPathWithArgs(path, type, data) {

    try {
        let nbt = toNbtTextFromPathAndData(path, NBTools.ParseNBT(data));
        switch (type) {
            case 'block':
                nbt = transformBlockTags(nbt)
                break;
            case 'entity':
                nbt = transformEntityTags(nbt)
                break;
            default:
                writeLine("## WARNING: 'storage' will not be transformed because we don't know what to do with it.")
                return { path: path, data: (data) };
        }
        let result = getNbtPathAndContent(nbt);
        if (result.path.startsWith(".")) {
            result.path = result.path.substring(1);
        }
        return result;
    } catch (e) {
        writeDebugLine(e);
        writeLine(`## WARNING: ${e.message}`)
        for (let i in DATAPATH_TRANSFORMATION) {
            let regexp = DATAPATH_TRANSFORMATION[i].regexp;
            let replacement = DATAPATH_TRANSFORMATION[i].replace;
            path = path.replace(regexp, replacement);
        }

    }
    return { path: path, data: data };
}
function transformDataPath(path, type) {
    let data = "FLAG";
    if (path.startsWith("{")) {
        switch (type) {
            case 'block':
                return NBTools.ToString(transformBlockTags(NBTools.ParseNBT(path)))
            case 'entity':
                return NBTools.ToString(transformEntityTags(NBTools.ParseNBT(path)))
            default:
                writeLine("## WARNING: 'storage' will not be transformed because we don't know what to do with it.")
                return path;
        }
    } else {
        try {
            let nbt = toNbtTextFromPathAndData(path, data);
            switch (type) {
                case 'block':
                    nbt = transformBlockTags(nbt)
                    break;
                case 'entity':
                    nbt = transformEntityTags(nbt)
                    break;
                default:
                    writeLine("## WARNING: 'storage' will not be transformed because we don't know what to do with it.")
            }
            // console.log(nbt)
            let result = getNbtPathAndContent(nbt);
            if (result.path.startsWith(".")) {
                result.path = result.path.substring(1);
            }

            return result.path;
        } catch (e) {
            writeDebugLine(e);
            for (let i in DATAPATH_TRANSFORMATION) {
                let regexp = DATAPATH_TRANSFORMATION[i].regexp;
                let replacement = DATAPATH_TRANSFORMATION[i].replace;
                path = path.replace(regexp, replacement);
            }
        }

    }

    return path;
}
function dealWithDataCommandArgWithArgs(comArgs, i) {
    var content = null;
    var result = null;
    switch (comArgs[i]) {
        case 'block':
            let x = comArgs[++i];
            let y = comArgs[++i];
            let z = comArgs[++i];
            var path = comArgs[++i];
            result = { result: `block ${x} ${y} ${z}`, type: "block", offset: i, path: path };

            return result;
        case 'entity':
            let target = comArgs[++i];
            target = transformSelector(target);
            var path = comArgs[++i];
            result = { result: `entity ${target}`, type: "entity", offset: i, path: path };

            return result;
        case 'storage':
            let source = comArgs[++i];
            var path = comArgs[++i];
            result = { result: `storage ${source}`, type: "storage", offset: i, path: path };
            return result;
        default:
            return { result: "", offset: i, path: "" };
    }
}
function dealWithDataCommandArgWithoutArgs(comArgs, i) {
    switch (comArgs[i]) {
        case 'block':
            let x = comArgs[++i];
            let y = comArgs[++i];
            let z = comArgs[++i];
            var path = comArgs[++i];
            if (path == undefined) return { result: `block ${x} ${y} ${z}`, offset: i, path: "" };
            path = transformDataPath(path, 'block');
            return { result: `block ${x} ${y} ${z} ${path}`, offset: i, path: path };
        case 'entity':
            let target = comArgs[++i];
            target = transformSelector(target);
            var path = comArgs[++i];
            if (path == undefined) return { result: `entity ${target}`, offset: i, path: "" };
            path = transformDataPath(path, 'entity');
            return { result: `entity ${target} ${path}`, offset: i, path: path };
        case 'storage':
            let source = comArgs[++i];
            var path = comArgs[++i];
            path = transformDataPath(path, 'storage');
            if (path == undefined) return { result: `storage ${source}`, offset: i, path: "" };
            return { result: `storage ${source} ${path}`, offset: i, path: path };
        default:
            return { result: comArgs[i], offset: i, path: "" };
    }
}
function transformCommand(command) {
    if (command == "") return "";
    let comArgs = [];
    try {
        comArgs = parseCommand(command);
        // writeLine(comArgs);

    } catch (error) {
        writeLine("## " + error.name + ": " + error.message);
        writeDebugLine(error);
        return command;
    }
    if (comArgs.length <= 0) {
        writeLine("## " + error.name + ": " + error.message);
        return command;
    }
    let cmdRoot = comArgs[0];
    let cmdRootR = cmdRoot;
    if (cmdRoot.startsWith("/")) cmdRootR = cmdRoot.substring(1);
    else if (cmdRoot.startsWith("$")) {
        writeLine("## WARNING: Macros may be not fully supported yet.")
        cmdRootR = cmdRoot.substring(1);
    }

    try {
        switch (cmdRootR) {

            case 'summon':
                if (comArgs.length < 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                }
                if (comArgs.length < 5) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                    //summon s x y z
                }
                if (comArgs.length == 5) {
                    return command;
                }
                let result = `${comArgs[0]} ${comArgs[1]} ${comArgs[2]} ${comArgs[3]} ${comArgs[4]} ${NBTools.ToString(transformEntityTags(NBTools.ParseNBT(comArgs[5]), comArgs[1]))}`;
                return result;
            case 'particle':
                if (comArgs.length < 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                }
                if (comArgs[1] == 'entity_effect') {
                    writeLine("## WARNING: Particle 'entity_effect' takes color argument when spawned from command '/particle entity_effect{color:[1.0, 0.0, 0.0], scale:2.0}'.")
                } else if (deleteNameSpace(comArgs[1]) == 'dust') {
                    let r = comArgs[2];
                    let g = comArgs[3];
                    let b = comArgs[4];
                    let s = comArgs[5];
                    let extra = "";
                    for (let j = 6; j < comArgs.length; j++) extra += " " + comArgs[j];
                    return `${comArgs[0]} ${comArgs[1]}{color:[${r}d, ${g}d, ${b}d],scale:${s}}${extra}`;
                } else if (['block', '​block_marker', '​falling_dust', 'dust_pillar'].includes(deleteNameSpace(comArgs[1]))) {
                    let block = comArgs[2];
                    let blockT = parseBlockArg(block);
                    let extra = "";
                    let blockState = "";
                    for (let key in blockT.components) {
                        blockState = blockState + (blockState == "" ? "" : ",") + warpKey(key) + ":" + JSON.stringify(blockT.components[key]);
                    }
                    for (let j = 3; j < comArgs.length; j++) extra += " " + comArgs[j];
                    return `${comArgs[0]} ${comArgs[1]}{block_state:{Name:${warpKey(blockT.id)},Properties:{${blockState}}}}${extra}`;
                } else if (deleteNameSpace(comArgs[1]) == 'item') {
                    let item = comArgs[2];
                    let itemT = parseItemArg(item);
                    let extra = "";
                    for (let j = 3; j < comArgs.length; j++) extra += " " + comArgs[j];
                    return `${comArgs[0]} ${comArgs[1]}{item:${warpKey(itemT.id)}}${extra}`;
                } else if (deleteNameSpace(comArgs[1]) == 'dust_color_transition') {
                    let fr = comArgs[2];
                    let fg = comArgs[3];
                    let fb = comArgs[4];
                    let tr = comArgs[5];
                    let tg = comArgs[6];
                    let tb = comArgs[7];
                    let s = comArgs[8];
                    let extra = "";
                    for (let j = 9; j < comArgs.length; j++) extra += " " + comArgs[j];
                    return `${comArgs[0]} ${comArgs[1]}{from_color:[${fr}d,${fg}d,${fb}d],scale:${s},to_color:[${tr}d,${tg}d,${tb}d]}${extra}`;
                } else {
                    return command;
                }
            case 'clear':
                if (comArgs.length < 2) {
                    return command;
                } else if (comArgs.length == 2) {
                    let selector = transformSelector(comArgs[1]);
                    return `${cmdRoot} ${selector}`;
                } else {
                    let selector = transformSelector(comArgs[1]);
                    let item = transformItem(comArgs[2], "~");
                    let extra = "";
                    if (comArgs.length == 4) {
                        extra = " " + comArgs[3];
                    }
                    return `${cmdRoot} ${selector} ${item}${extra}`;
                }
            case 'setblock':
                //setblock x y z block
                var tmp = "";
                for (let i = 0; i < 4; i++) {
                    if (comArgs[i] == undefined) {
                        writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                        return command;
                    }
                    tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                }
                let block = transformBlock(comArgs[4]);
                tmp += " " + block;

                for (let i = 5; i < comArgs.length; i++) {
                    tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                }
                return `${tmp}`;
                break;
            case 'fill':
                //fill x y z x y z block
                var tmp = "";
                for (let i = 0; i < 7; i++) {
                    if (comArgs[i] == undefined) {
                        writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                        return command;
                    }
                    tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                }
                if (comArgs.length >= 9) {
                    let block = transformBlock(comArgs[7]);
                    tmp += " " + block;
                    if (comArgs[8] == 'replace') {
                        let block2 = comArgs[9];
                        if (block2 != undefined) {
                            block2 = transformBlock(block2);
                            tmp += " replace " + block2;
                        }
                    } else {
                        for (let i = 8; i < comArgs.length; i++) {
                            tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                        }
                    }
                    return `${tmp}`;
                } else {
                    let block = transformBlock(comArgs[7]);

                    return `${tmp} ${block}`;
                }
                break;
            case 'data':
                let res = "";
                var i = 0;
                res = comArgs[i];
                let type = comArgs[++i];
                switch (type) {
                    case 'get':
                    case 'remove':
                        res += ` ${type} ${dealWithDataCommandArgWithoutArgs(comArgs, ++i).result}`;
                        return res;
                    case 'modify':
                        let tresult = dealWithDataCommandArgWithArgs(comArgs, ++i);
                        let path = tresult.path;
                        i = tresult.offset;
                        let controlType = comArgs[++i];
                        let dresult = null;
                        let data = null;
                        let fromType = "", ress = null;
                        res += ` ${type} ${tresult.result}`;
                        switch (controlType) {
                            case 'set':
                                fromType = comArgs[++i];
                                if (fromType == 'value') {
                                    data = comArgs[++i];
                                    let ress = transformDataPathWithArgs(path, tresult.type, data);
                                    res += ` ${ress.path} ${controlType} ${fromType} ${ress.data}`;
                                    break;
                                }
                                if (fromType == 'string') {
                                    writeLine(ERROR_MESSAGES.UNSUPPORTED);
                                    return command;
                                }
                                dresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                                ress = transformDataPathWithArgs(path, tresult.type, "FLAG");
                                writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM)
                                res += ` ${ress.path} ${controlType} ${fromType} ${dresult.result}`;

                                break;
                            case 'insert':
                                insertIdx = comArgs[++i];
                                fromType = comArgs[++i];
                                if (fromType == 'value') {
                                    data = comArgs[++i];
                                    let ress = transformDataPathWithArgs(path, tresult.type, [data]);
                                    res += ` ${ress.path} ${controlType} ${insertIdx} ${fromType} ${ress.data}`;
                                    break;
                                }
                                if (fromType == 'string') {
                                    writeLine(ERROR_MESSAGES.UNSUPPORTED);
                                    return command;
                                }
                                dresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                                ress = transformDataPathWithArgs(path, tresult.type, "FLAG");
                                writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM)
                                res += ` ${ress.path} ${controlType} ${insertIdx} ${fromType} ${dresult.result}`;
                                break;
                            default:
                                transformDataPathWithArgs(path, [data]);
                                fromType = comArgs[++i];
                                if (fromType == 'value') {
                                    data = comArgs[++i];
                                    let ress = transformDataPathWithArgs(path, tresult.type, [data]);
                                    res += ` ${ress.path} ${controlType} ${fromType} ${ress.data}`;
                                    break;
                                }
                                if (fromType == 'string') {
                                    writeLine(ERROR_MESSAGES.UNSUPPORTED);
                                    return command;
                                }
                                dresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                                ress = transformDataPathWithArgs(path, tresult.type, "FLAG");
                                writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM)
                                res += ` ${ress.path} ${controlType} ${fromType} ${dresult.result}`;
                                break;
                        }

                        return res;
                    case 'merge':
                        writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM);
                        let tresult2 = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                        i = tresult2.offset;
                        res += ` ${type} ${tresult2.result}`;
                        return res;
                    default:
                        throw new SyntaxError(ERROR_MESSAGES.UNKNOWN_ARGUMENTS)
                }
                break;
            case 'execute':
                var tmp = "", i = 0;
                while (i < comArgs.length && comArgs[i] != 'run') {
                    if (comArgs[i] == 'if' || comArgs[i] == 'unless') {
                        let ifOrUnless = comArgs[i];
                        i++;//Skip if or unless
                        let testType = comArgs[i];
                        if (testType == 'data') {
                            i++;
                            let transformResult = dealWithDataCommandArgWithoutArgs(comArgs, i);
                            i = transformResult.offset;
                            let result = transformResult.result;
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType} ` + result;
                        } else if (testType == 'entity') {
                            i++;
                            let selector = transformSelector(comArgs[i]);
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType} ` + selector;
                        } else if (testType == 'block') {
                            let x = comArgs[++i];
                            let y = comArgs[++i];
                            let z = comArgs[++i];
                            let block = transformBlock(comArgs[++i]);
                            let result = `${x} ${y} ${z} ${block}`;
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType} ` + result;
                        } else {
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType}`;
                        }
                    } else if (comArgs[i] == 'store') {
                        let storeResultType = comArgs[++i]; // result or success
                        let tresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i)
                        tmp += (tmp == "" ? "" : " ") + "store " + storeResultType + " " + tresult.result;
                        i = tresult.offset;
                    } else if (comArgs[i].startsWith("@")) {
                        let selector = transformSelector(comArgs[i]);
                        tmp += (tmp == "" ? "" : " ") + selector;
                    } else {
                        tmp += (tmp == "" ? "" : " ") + comArgs[i];
                    }
                    i++;
                }
                i++; // Skip 'run'
                if (i < comArgs.length) {
                    let executeCommand = "";
                    for (let j = i; j < comArgs.length; j++) {
                        executeCommand += (executeCommand == "" ? "" : " ") + comArgs[j];
                    }
                    tmp += " run " + transformCommand(executeCommand);
                }
                return tmp;
            case 'give':
                if (comArgs.length <= 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                } else {
                    let selector = transformSelector(comArgs[1]);
                    let item = transformItem(comArgs[2]);
                    let extra = "";
                    for (let i = 3; i < comArgs.length; i++) {
                        extra += " " + comArgs[i];
                    }
                    return `${cmdRoot} ${selector} ${item}${extra}`;
                }
            case 'item':
                if (comArgs.length <= 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                } else {
                    if (comArgs[1] == 'replace') {
                        if (comArgs[2] == 'block') {
                            if (comArgs.length < 8) {
                                writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                return command;
                            }
                            if (comArgs[7] == 'with') {
                                if (comArgs.length < 9) {
                                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                    return command;
                                }
                                let item = transformItem(comArgs[8]);
                                let position = transformId(ITEMSLOT_TRANSFORMATION, comArgs[6]);
                                let count = comArgs[9];
                                if (count !== undefined)
                                    return `${cmdRoot} replace block ${comArgs[3]} ${comArgs[4]} ${comArgs[5]} ${position} with ${item} ${count}`;
                                return `${cmdRoot} replace block ${comArgs[3]} ${comArgs[4]} ${comArgs[5]} ${position} with ${item}`;
                            }
                        } else if (comArgs[2] == 'entity') {
                            if (comArgs.length < 6) {
                                writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                return command;
                            }
                            if (comArgs[5] == 'with') {
                                if (comArgs.length < 7) {
                                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                    return command;
                                }
                                let selector = transformSelector(comArgs[3]);
                                let position = transformId(ITEMSLOT_TRANSFORMATION, comArgs[4]);
                                let item = transformItem(comArgs[6]);
                                let count = comArgs[7];
                                if (count !== undefined)
                                    return `${cmdRoot} replace entity ${selector} ${position} with ${item} ${count}`;
                                return `${cmdRoot} replace entity ${selector} ${position} with ${item}`;
                            }
                        }
                    }


                }
            default:
                // let i = 0;
                let tmpp = "";
                for (let j = 0; j < comArgs.length; j++) {
                    if (comArgs[j].startsWith("@")) {
                        let selector = transformSelector(comArgs[j]);
                        tmpp += (tmpp == "" ? "" : " ") + selector;
                    } else {
                        tmpp += (tmpp == "" ? "" : " ") + comArgs[j];
                    }
                }
                return tmpp;
            // case 'clear':
        }
    } catch (error) {
        writeDebugLine(error);
        writeLine("## Error while transformating command: " + error.message);
    }
    return command;
}
function transformSelector(selectorText) {
    let selector = parseSelectorArg(selectorText);
    let not = false;
    if (selector.components != undefined) for (let i in selector.components) {
        let obj = selector.components[i];
        if (obj.key == 'nbt') {
            let NBTs = obj.value;
            if (NBTs.startsWith("!")) { not = true; NBTs = NBTs.substring(1); }
            else not = false;
            obj.value = (not ? "!" : "") + NBTools.ToString(transformEntityTags(NBTools.ParseNBT(NBTs), "player"));
        }
    }
    // console.log(selector)
    // TODO: 转换 selector 中 nbt
    return toSelectorText(selector);
}
function transformEntityItemTag(itemTag) {
    // console.log(itemTag)
    let id = itemTag.id;
    let rawid = getNbtContent(id);
    let count = getNbtContent(itemTag.Count);
    let tag = itemTag.tag;
    let slot = itemTag.Slot;
    let components = null;
    let result = { id: id, count: count };
    if (tag != undefined) {
        components = transformItemTags(tag, rawid);
        result['components'] = {};
        for (var key in components) {
            result['components']["minecraft:" + (key)] = components[key];
        }
    }
    if (slot != undefined) {
        result['Slot'] = slot;
    }

    return result;
}
function transformItemItemsTag(itemTag) {
    let id = itemTag.id;
    let rawid = getNbtContent(id);

    let count = getNbtContent(itemTag.Count);
    let tag = itemTag.tag;
    let slot = itemTag.Slot;
    let components = null;
    let result = { slot: 0, item: {} };
    let result1 = { id: id, count: count };
    if (tag != undefined) {
        components = transformItemTags(tag, rawid);
        result1['components'] = {};
        for (var key in components) {
            result1['components'][(`minecraft:${key}`)] = components[key];
        }
    }
    if (slot != undefined) {
        result['slot'] = slot;
    }
    result['item'] = result1;

    return result;
}
function transformItemBlockEntityItemTag(blockItemArrays) {
    let result = [];
    for (let i in blockItemArrays) {
        if (blockItemArrays[i] == null) result.push(null)
        else result.push(transformItemItemsTag(blockItemArrays[i]));

    }
    return result;
}
function transformBlockItemTag(blockItemArrays) {
    let result = [];
    for (let i in blockItemArrays) {
        if (blockItemArrays[i] == null) result.push(null)
        else result.push(transformEntityItemTag(blockItemArrays[i]));
    }
    return result;
}
function transformBlock(blockText) {
    let item = parseItemArg(blockText);
    // console.log(NBTools.ToString(item.tags))
    if (item.components != null) {
        return blockText;
    }
    if (item.tags != null) {
        let transformedTags = transformBlockTags(item.tags);
        item.tags = transformedTags;
    }
    return toItemText(item);
}
function transformItem(itemText, splitChar = '=') {
    let item = parseItemArg(itemText);
    // console.log(NBTools.ToString(item.tags))
    if (item.components != null) {
        return itemText;
    }
    if (item.tags != null) {
        let transformedComponent = transformItemTags(item.tags, item.id);
        item.components = transformedComponent;
        item.tags = undefined;
    }
    return toItemText(item, splitChar);
}
function transFormOldPos(pos) {
    return [pos.X, pos.Y, pos.Z];
}
function transformProfileProperties(property) {
    let Signature = property['Signature'];
    let Value = property['Value'];
    let name = 'textures';
    return { name: name, value: Value, signature: Signature };
}
function transformProfile(tag) {
    let result = {};
    if (typeof tag === 'object') {
        let name = tag['Name'];
        let properties = tag['Properties'];
        if (properties != undefined) writeLine("## WARNING: We found that you used 'Properties' tag for your player_head. We strongly recommand that you shouldn't use this tag! Due to a problem: https://bugs.mojang.com/browse/MC-268000")
        let id = tag['Id'];
        result = { name: name, id: id };
        if (properties != undefined) {
            result['properties'] = [];
            if (Array.isArray(properties['textures'])) {
                for (let i in properties['textures']) {
                    result['properties'].push(transformProfileProperties(properties['textures'][i]))
                }
            }
        }
    } else {
        result = tag;
    }
    return result;
}
function transformBlockTags(tag) {
    if (tag['SkullOwner'] != undefined) {
        let t = tag['SkullOwner'];
        tag['profile'] = transformProfile(t);
        delete SkullOwner;
    }
    if (tag['Items'] != undefined) {
        tag['Items'] = transformBlockItemTag(tag['Items']);
    }
    if (tag['FlowerPos'] != undefined) {
        tag['flower_pos'] = transformBlockItemTag(tag['FlowerPos']);
        delete tag['FlowerPos'];
    }
    if (tag['ExitPortal'] != undefined) {
        tag['exit_portal'] = transformBlockItemTag(tag['ExitPortal']);
        delete tag['ExitPortal'];
    }
    return tag;
}
function transformEntityTags(tag, entityId = undefined) {
    if (tag['Attributes'] != undefined) {
        let t = tag['Attributes'];
        tag['attributes'] = [];
        let newtags = tag['attributes'];
        for (let i in t) {
            let newtag = { base: t[i]['Base'], id: t[i]['Name'] };
            if (t[i]['Modifiers'] != null) {
                newtag.modifiers = transformAttribute(t[i]['Modifiers'])
            }
            // id，由 Name重命名。
            // base，由 Base重命名。
            // modifiers，由 Modifiers重命名。
            newtags.push(newtag);
        }
        delete tag['Attributes'];
    }
    if (tag['BeamTarget'] != undefined) {
        tag['beam_target'] = tag['BeamTarget'];
        delete tag['BeamTarget'];
    }
    if (tag['BeamTarget'] != undefined) {
        tag['beam_target'] = tag['BeamTarget'];
        delete tag['BeamTarget'];
    }
    if (tag['custom_potion_effects'] != undefined) {
        let custom_potion_effects = tag['custom_potion_effects']
        if (tag['item'] == undefined) {
            tag['item'] = { id: "minecraft:tipped_arrow", count: 1, components: { "minecraft:potion_contents": {} } }
        }
        tag['item']['components']["minecraft:potion_contents"]['custom_effects'] = custom_potion_effects;
        delete tag['custom_potion_effects'];
    }
    if (tag['CustomPotionColor'] != undefined) {
        let color = tag['CustomPotionColor']
        if (tag['item'] == undefined) {
            tag['item'] = { id: "minecraft:tipped_arrow", count: 1, components: { "minecraft:potion_contents": {} } }
        }
        tag['item']['components']["minecraft:potion_contents"]['custom_color'] = color;
        delete tag['CustomPotionColor'];
    }
    if (tag['Potion'] != undefined) {
        if (deleteNameSpace(entityId) == 'area_effect_cloud') {
            if (tag['potion_contents'] == undefined) {
                tag['potion_contents'] = {}
            }
            tag['potion_contents'].potion = tag['Potion'];

        } else {
            let potion = tag['Potion']
            if (tag['item'] == undefined) {
                tag['item'] = { id: "minecraft:tipped_arrow", count: 1, components: { "minecraft:potion_contents": {} } }
            }
            tag['item']['components']["minecraft:potion_contents"]['potion'] = potion;
            delete tag['Potion'];
        }

    }
    if (tag['effects'] != undefined) {
        if (tag['potion_contents'] == undefined) {
            tag['potion_contents'] = {}
        }
        tag['potion_contents'].custom_effects = tag['effects'];
    }
    if (tag['Color'] != undefined) {
        if (tag['potion_contents'] == undefined) {
            tag['potion_contents'] = {}
        }
        tag['potion_contents'].custom_color = tag['Color'];
    }
    if (tag['FireworksItem'] != undefined) {
        tag['FireworksItem'] = transformEntityItemTag(tag['FireworksItem']);
    }
    if (tag['ArmorItems'] != undefined) {

        for (let i in tag['ArmorItems']) {
            tag['ArmorItems'][i] = transformEntityItemTag(tag['ArmorItems'][i]);
        }
    }
    if (tag['DecorItem'] != undefined) {
        tag['DecorItem'] = transformEntityItemTag(tag['DecorItem']);
    }
    if (tag['HandItems'] != undefined) {
        for (let i in tag['HandItems']) {
            tag['HandItems'][i] = transformEntityItemTag(tag['HandItems'][i]);
        }
    }
    if (tag['FlowerPos'] != undefined) {
        tag['hive_pos'] = tag['FlowerPos'];
        delete tag['FlowerPos'];
    }
    if (tag['HivePos'] != undefined) {
        tag['flower_pos'] = tag['HivePos'];
        delete tag['HivePos'];
    }

    if (tag['PatrolTarget'] != undefined) {
        tag['patrol_target'] = tag['PatrolTarget'];
        delete tag['PatrolTarget'];
    }
    if (tag['WanderTarget'] != undefined) {
        tag['wander_target'] = tag['WanderTarget'];
        delete tag['WanderTarget'];
    }
    if (tag['Leash'] != undefined) {
        tag['leash'] = tag['Leash'];
        delete tag['Leash'];
    }
    if (tag['Item'] != undefined) {
        tag['Item'] = transformEntityItemTag(tag['Item']);
    }
    // writeDebugLine(tag)
    if (tag['Inventory'] != undefined) {
        tag['Inventory'] = transformBlockItemTag(tag['Inventory'])
    }
    if (tag['SelectedItem'] != undefined) {
        tag['SelectedItem'] = transformEntityItemTag(tag['SelectedItem'])
    }
    return tag;
}
function transformAttribute(arrs) {
    let modifiers = [];
    for (let i in arrs) {
        let type = arrs[i]['AttributeName'];
        let slot = arrs[i]['Slot'];
        let uuid = getNbtContent(arrs[i]['UUID']);
        let name = arrs[i]['Name'];
        let amount = arrs[i]['Amount'];
        let operation = transformId(ARRTIBUTEOPERATION_TRANSFORMATION, arrs[i]['Operation']);
        let modifier = {};
        if (type !== undefined) {
            modifier['type'] = type;
        } if (slot === undefined) {
            slot = 'any';
        }
        modifier['slot'] = slot;
        if (uuid !== undefined) {
            let uid = "" + parseInt(Math.random() * (1000));
            uid = "i";
            // console.log(uuid)
            for (let i = 0; i < uuid.length; i++) {
                uid += "" + uuid[i];
            }
            modifier['id'] = uid;
        } if (name === undefined) {
            name = 'noName'
        }
        modifier['name'] = name;
        if (amount !== undefined) {
            modifier['amount'] = amount;
        } if (operation !== undefined) {
            modifier['operation'] = operation;
        }
        modifiers.push(modifier);
    }
    return modifiers;
}
function transformItemTags(tag, itemId = undefined) {
    let components = {};
    let hiddenflags = 0;
    for (let key in tag) {
        switch (key) {
            case 'HideFlags':
                hiddenflags = getNbtContent(tag[key]);
                break;
            case 'StoredEnchantments':
                components['stored_enchantments'] = { levels: {} };
                for (let i = 0; i < tag[key].length; i++) {
                    let id = getNbtContent(tag[key][i]['id']);
                    id = transformId(ENCHANTMENTS_TRANSFORMATION, id);
                    let level = tag[key][i]['lvl'];
                    components['stored_enchantments']['levels'][id] = level;
                }
                break;
            case 'Enchantments':
                components['enchantments'] = { levels: {} };
                for (let i = 0; i < tag[key].length; i++) {
                    let id = getNbtContent(tag[key][i]['id']);
                    // console.log(id)
                    id = "minecraft:" + deleteNameSpace(transformId(ENCHANTMENTS_TRANSFORMATION, id));
                    if (id == "" || id == "none") {
                        components['enchantment_glint_override'] = true;
                        continue;
                    }
                    let level = tag[key][i]['lvl'];
                    components['enchantments']['levels'][id] = level;
                }
                break;
            case 'Damage':
                components['damage'] = getNbtContent(tag[key]);
                break;
            case 'RepairCost':
                components['repair_cost'] = getNbtContent(tag[key]);
                break;
            case 'Unbreakable':
                if (getNbtContent(tag[key]))
                    components['unbreakable'] = {};
                break;
            case 'display':
                //custom_name color lore
                // components['repair_cost'] = getNbtContent(tag[key]);
                let name = (tag[key]['Name']); //custom_name
                let lore = (tag[key]['Lore']); //lore
                let color = (tag[key]['color']); //dyed_color
                let mapcolor = tag[key]['MapColor'];
                if (name !== undefined) {
                    components['custom_name'] = (name);
                }
                if (lore !== undefined) {
                    components['lore'] = (lore);
                }
                if (color !== undefined) {
                    components['dyed_color'] = { rgb: (color) };
                }
                if (mapcolor !== undefined) {
                    components['map_color'] = (mapcolor);
                }
                break;
            case 'CanDestroy':
                components['can_break'] = { predicates: [{ blocks: [] }] };
                var k = 0;
                for (let i = 0; i < tag[key].length; i++) {
                    if (getNbtContent(tag[key][i]).startsWith("#")) {
                        if (components['can_break']['predicates'][k]['blocks'].length != 0)
                            k++;
                        components['can_break']['predicates'][k] = { "blocks": tag[key][i] };
                        k++;
                        if (i < tag[key].length - 1)
                            components['can_break']['predicates'][k] = { blocks: [] }
                    } else
                        components['can_break']['predicates'][k]['blocks'].push(tag[key][i]);
                }
                break;
            case 'CanPlaceOn':
                components['can_place_on'] = { predicates: [{ blocks: [] }] };
                var k = 0;
                for (let i = 0; i < tag[key].length; i++) {
                    if (getNbtContent(tag[key][i]).startsWith("#")) {
                        if (components['can_place_on']['predicates'][k]['blocks'].length != 0)
                            k++;
                        components['can_place_on']['predicates'][k] = { "blocks": tag[key][i] };
                        k++;
                        if (i < tag[key].length - 1)
                            components['can_place_on']['predicates'][k] = { blocks: [] }
                    } else
                        components['can_place_on']['predicates'][k]['blocks'].push(tag[key][i]);
                }
                break;
            case 'AttributeModifiers':
                let arrs = (tag[key]);
                let modifiers = transformAttribute(arrs);
                components['attribute_modifiers'] = { modifiers: modifiers };

                break;

            case 'Charged':
                if (components['charged_projectiles'] == undefined) components['charged_projectiles'] = [];
                break;
            case 'ChargedProjectiles':
                components['charged_projectiles'] = transformBlockItemTag(tag[key]);
                break;
            case 'Items':
                if (deleteNameSpace(itemId) == 'bundle' || itemId == "" || itemId == undefined)
                    components['bundle_contents'] = transformBlockItemTag(tag[key]);
                else {
                    if (components['custom_data'] == undefined) components['custom_data'] = {};
                    components['custom_data'][key] = transformBlockItemTag(tag[key]);
                }
                break;
            case 'Decorations':
                components['map_decorations'] = {};
                for (let i in tag[key]) {
                    let id = (tag[key][i]['id']);
                    let type = (tag[key][i]['type']);
                    let x = (tag[key][i]['x']);
                    let z = (tag[key][i]['z']);
                    let rotation = getNbtContent(tag[key][i]['rot']);
                    type = transformId(MAP_TRANSFORMATION, type);

                    components['map_decorations'][id] = { type: type, x: x, y: y, rotation: rotation + "f" };
                }
                break;
            case 'map':
                components['map_id'] = (tag[key]);
                break;
            case 'Potion':
                if (components['potion_contents'] == undefined) components['potion_contents'] = {};
                components['potion_contents'].potion = tag[key]
                break;
            case 'CustomPotionColor':
                if (components['potion_contents'] == undefined) components['potion_contents'] = {};
                components['potion_contents'].custom_color = tag[key]
                break;
            case 'custom_potion_effects':
                if (components['potion_contents'] == undefined) components['potion_contents'] = {};
                components['potion_contents'].custom_effects = (tag[key]);

                break;
            case 'pages':
                if (deleteNameSpace(itemId) == 'writable_book') {
                    if (components['writable_book_content'] == undefined) components['writable_book_content'] = {}
                    let pages = tag[key];
                    components['writable_book_content']['pages'] = [];
                    for (let i in pages) {
                        components['writable_book_content']['pages'][i] = { raw: pages[i] };
                    }
                } else {
                    if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                    components['written_book_content'] = {};
                    let pages = tag[key];
                    components['written_book_content']['pages'] = [];
                    for (let i in pages) {
                        components['written_book_content']['pages'][i] = { raw: pages[i] };
                    }
                }

                break;
            case 'filtered_pages':
                if (deleteNameSpace(itemId) == 'writable_book') {
                    if (components['writable_book_content'] == undefined) components['writable_book_content'] = {}
                    if (components['writable_book_content']['pages'] == undefined) components['writable_book_content']['pages'] = [];
                    for (let i in pages) {
                        if (components['writable_book_content']['pages'][i] == undefined)
                            components['writable_book_content']['pages'][i] = { filtered: pages[i] };
                        else components['writable_book_content']['pages'][i].filtered = pages[i];
                    }
                } else {
                    if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                    if (components['written_book_content']['pages'] == undefined) components['written_book_content']['pages'] = [];
                    for (let i in pages) {
                        if (components['written_book_content']['pages'][i] == undefined)
                            components['written_book_content']['pages'][i] = { filtered: pages[i] };
                        else components['written_book_content']['pages'][i].filtered = pages[i];
                    }
                }
                break;
            case 'author':
                if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                components['written_book_content']['author'] = tag[key];
                break;
            case 'generation':
                if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                components['written_book_content']['generation'] = tag[key];
                break;
            case 'resolved':
                if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                components['written_book_content']['resolved'] = tag[key];
                break;
            case 'title':
                if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                components['written_book_content']['title'] = tag[key];
                break;
            case 'filtered_title':
                if (components['written_book_content'] == undefined) components['written_book_content'] = {}
                components['written_book_content']['title'] = { raw: components['written_book_content']['title'], filtered: tag[key] };
                break;
            case 'Trim':
                components['trim'] = tag[key];
                break;
            case 'effects':
                components['suspicious_stew'] = tag[key];
                break;
            case 'DebugProperty':
                components['debug_stick_state'] = tag[key];
                break;
            case 'EntityTag':
                components['entity_data'] = tag[key];
                break;
            case 'NoAI':
            case 'Silent':
            case 'NoGravity':
            case 'Glowing':
            case 'Invulnerable':
            case 'Health':
            case 'Age':
            case 'Variant':
            case 'HuntingCooldown':
            case 'BucketVariantTag ':
                components['bucket_entity_data'][key] = tag[key];
                break;
            case 'instrument':
                components['instrument'] = tag[key];
                break;
            case 'Recipes':
                components['recipes'] = tag[key];
                break;
            case 'LodestonePos':
                if (components['lodestone_tracker'] == undefined) components['lodestone_tracker'] = { target: {} };
                components['lodestone_tracker']['target']['pos'] = transFormOldPos(tag[key]);
                break;
            case 'LodestoneDimension':
                if (components['lodestone_tracker'] == undefined) components['lodestone_tracker'] = { target: {} };
                components['lodestone_tracker']['target']['dimension'] = tag[key];
                break;
            case 'LodestoneTracked':
                if (components['lodestone_tracker'] == undefined) components['lodestone_tracker'] = { target: {} };
                components['lodestone_tracker']['tracked'] = tag[key];
                break;
            case 'Explosion':
                components['firework_explosion'] = { shape: transformId(FIREWORK_TRANSFORMATION, defaultOrValue(tag[key].Type, 0)), color: defaultOrValue(tag[key].Colors, []), fade_colors: defaultOrValue(tag[key].FadeColors, []), has_trail: defaultOrValue(tag[key].Trail, false), has_twinkle: defaultOrValue(tag[key].Flicker, false) };
                break;
            case 'Fireworks':
                components['fireworks'] = { explosions: [], flight_duration: defaultOrValue(tag[key].Flight, 0) };
                for (let i in tag[key].Explosions) {
                    let fireworkEffect = tag[key].Explosions[i];
                    let color = defaultOrValue(fireworkEffect['Colors'], []);
                    let fade_color = defaultOrValue(fireworkEffect['FadeColors'], []);
                    let flicker = defaultOrValue(fireworkEffect['Flicker'], false);
                    let trail = defaultOrValue(fireworkEffect['Trail'], false);
                    let type = transformId(FIREWORK_TRANSFORMATION, defaultOrValue(fireworkEffect['Type'], 0));
                    let fireworkEffectNew = { shape: type, color: color, fade_colors: fade_color, has_trail: trail, has_twinkle: flicker }
                    components['fireworks']['explosions'].push(fireworkEffectNew);
                }
                break;
            case 'SkullOwner':
                let t = tag[key];
                components['profile'] = transformProfile(t);
                break;
            case 'BlockEntityTag':
                let note_block_sound = tag[key]['note_block_sound'];
                let base_color = transformId(FLAGSCOLOR_TRANSFORMATION, tag[key]['Base']);
                let banner_patterns = tag[key]['Patterns'];
                let pot_decorations = tag[key]['sherds'];
                let container = transformItemBlockEntityItemTag(tag[key]['Items']);
                let bees = tag[key]['Bees'];
                let lock = tag[key]['Lock'];
                let LootTable = tag[key]['LootTable']; //container_loot = {loot_table:,seed:}
                let LootTableSeed = tag[key]['LootTableSeed'];
                if (note_block_sound != undefined) {
                    components['note_block_sound'] = note_block_sound;
                    delete tag[key]['note_block_sound'];
                }
                if (base_color != undefined) {
                    components['base_color'] = base_color;
                    delete tag[key]['Base'];
                }
                if (banner_patterns != undefined) {
                    components['banner_patterns'] = transformBannerPatterns(banner_patterns);
                    delete tag[key]['Patterns'];
                }
                if (pot_decorations != undefined) {
                    components['pot_decorations'] = pot_decorations;
                    delete tag[key]['sherds'];
                }
                if (container != undefined) {
                    components['container'] = container;
                    delete tag[key]['Items'];
                }
                if (bees != undefined) {
                    components['bees'] = bees;
                    delete tag[key]['Bees'];
                }
                if (lock != undefined) {
                    components['lock'] = lock;
                    delete tag[key]['Lock'];
                }
                if (LootTable != undefined) {
                    components['container_loot'] = { loot_table: LootTable };
                    delete tag[key]['LootTable'];
                    //container_loot = 
                    if (LootTableSeed != undefined) {
                        components['container_loot']['seed'] = LootTableSeed;
                        delete tag[key]['LootTableSeed'];
                    }
                }
                let sum = 0;
                for (let i in tag[key]) sum++;
                if (sum != 0) {
                    writeLine("## WARNING: We found that you used 'BlockEntityTag' tag for your item. You may need to add a 'id' tag (for example: 'id: \"minecraft:oak\"') due to new changes.")
                    components['block_entity_data'] = tag[key];
                }

                break;
            case 'BlockStateTag':
                components['block_state'] = (tag[key]);
                break;
            case 'CustomModelData':
                components['custom_model_data'] = (tag[key]);
                break;
            /*  
                HideFlags
            */
            default:
                if (components['custom_data'] === undefined) components['custom_data'] = {};
                components['custom_data'][key] = tag[key];
            // console.log(key)
            // Put it into custom_data
        }
    }
    if (components['potion_contents'] != null) {
        if (components['potion_contents'].custom_effects != null) {
            for (let i in components['potion_contents'].custom_effects) {
                let k = components['potion_contents'].custom_effects[i];
                if ([1, "1", "1b", true, "true"].includes(k['ambient'])) {
                    k['ambient'] = true
                } else if ([0, "0", "0b", false, "false"].includes(k['ambient'])) {
                    k['ambient'] = false
                }
                if ([1, "1", "1b", true, "true"].includes(k['show_particles'])) {
                    k['show_particles'] = true
                } else if ([0, "0", "0b", false, "false"].includes(k['show_particles'])) {
                    k['show_particles'] = false
                }
                if ([1, "1", "1b", true, "true"].includes(k['show_icon'])) {
                    k['show_icon'] = true
                } else if ([0, "0", "0b", false, "false"].includes(k['show_icon'])) {
                    k['show_icon'] = false
                }
            }
        }

    }
    if (hiddenflags > 0) {
        if (hiddenflags & (1 << 0)) {
            if (components['enchantments'] != undefined) {
                components['enchantments']['show_in_tooltip'] = false;
            }
        }
        if (hiddenflags & (1 << 1)) {
            if (components['attribute_modifiers'] != undefined) {
                components['attribute_modifiers']['show_in_tooltip'] = false;
            }

        }
        if (hiddenflags & (1 << 2)) {
            if ((components['unbreakable']) != undefined) {
                components['unbreakable']['show_in_tooltip'] = false;
            }
        }
        if (hiddenflags & (1 << 3)) {
            if (components['can_break'] != undefined) {
                components['can_break']['show_in_tooltip'] = false;
            }

        }
        if (hiddenflags & (1 << 4)) {
            if (components['can_place_on'] != undefined) {
                components['can_place_on']['show_in_tooltip'] = false;
            }

        }
        if (hiddenflags & (1 << 5)) {
            if (components['stored_enchantments'] != undefined) {
                components['stored_enchantments']['show_in_tooltip'] = false;
            }

        }
        if (hiddenflags & (1 << 6)) {
            if (components['dyed_color'] != undefined) {
                components['dyed_color']['show_in_tooltip'] = false;
            }
        }
        if (hiddenflags & (1 << 7)) {
            components['hide_additional_tooltip'] = {};
        }
    }
    return components;
}

module.exports = { transformId, ENCHANTMENTS_TRANSFORMATION, ARRTIBUTEOPERATION_TRANSFORMATION, ITEMSLOT_TRANSFORMATION, MAP_TRANSFORMATION, FIREWORK_TRANSFORMATION, FLAGSCOLOR_TRANSFORMATION, DATAPATH_TRANSFORMATION, transformJSON, transformCommand }

},{"../ErrorMessages.js":1,"../NBTool.js":3,"../inputSystem.js":5,"../mccommand.js":6}],10:[function(require,module,exports){
const { writeLine, writeDebugLine } = require("../inputSystem.js");
const { ERROR_MESSAGES } = require("../ErrorMessages.js");
const { defaultOrValue, parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, toItemText, deleteNameSpace, toSelectorText } = require("../mccommand.js");
const { NBTools, getNbtContent, warpKey, getNbtType } = require("../NBTool.js");

const DATAPATH_TRANSFORMATION = [];
function transformId(array, id) {
    let res = array[id];
    if (res == undefined || res == "") return id;
    return res;
}

function transformTellraw(text, fallback = "") {
    let d = text;
    try {
        d = JSON.parse(d);
    } catch (e) {
        d = JSON.parse(fallback);
    }
    return JSON.stringify(transformRawMsg(d));
}
function transformClickEvent(data) {
    if (data['action'] == 'run_command' || data['action'] == 'suggest_command') {
        data['command'] = data['value'];
        delete data['value'];
    } else if (data['action'] == 'open_url') {
        data['url'] = data['value'];
        delete data['value'];
    } else if (data['action'] == 'change_page') {
        data['page'] = parseInt(data['value']);
        delete data['value'];
    }
    return data;
}
function transformHoverEvent(data) {
    if (data['action'] == 'show_text') {
        if (data['contents'] != null) {
            if (data['value'] == null) {
                data['value'] = data['contents'];
                delete data['contents'];
            }
        }
    }
    return data;

}
function transformRawMsg(data) {
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            transformRawMsg(data[i]);
        }
        return data;
    } else if (typeof data === 'object') {
        if (data['clickEvent'] != null) {
            data['click_event'] = transformClickEvent(data['clickEvent']);
            delete data['clickEvent'];
        }
        if (data['hoverEvent'] != null) {
            data['hover_event'] = transformHoverEvent(data['hoverEvent']);
            delete data['hoverEvent'];
        }
        if (data['extra'] != null) {
            transformRawMsg(data['extra']);
        }
        return data;
    } else {
        return (data);
    }
}
function toNbtTextFromPathAndData(path, data = "") {
    let text = path;
    let pathStack = [];
    var stack = [];
    var tempStr = '';
    var fanXieGang = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] == "\"" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "\"") stack.pop()
            else stack.push("\"");
        } else if (stack[stack.length - 1] != '"' && stack[stack.length - 1] != "'") {
            if (text[i] == '[') {
                pathStack.push(tempStr)
                tempStr = text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('[');
            } else if (text[i] == ']') {
                if (stack[stack.length - 1] == '[') { tempStr += text[i]; pathStack.push(tempStr); tempStr = ""; stack.pop(); }
                else {
                    throw SyntaxError("Unexpected '" + text[i] + "' in " + (i));
                }
            } else if (text[i] == '.') {
                if (tempStr != "") {
                    pathStack.push(tempStr);
                    tempStr = "";
                    stack.pop();
                }
            } else {
                tempStr += text[i];
            }
        } else {
            tempStr += text[i];
        }
        if (fanXieGang) fanXieGang = 0;
        else if (text[i] == '\\') {
            fanXieGang = 1;
        }
    }
    if (stack.length > 0) {
        throw SyntaxError("Missing '" + stack[0] + "' in " + (text.length - 1));
    }
    if (fanXieGang > 0) {
        throw SyntaxError("Escape error.");
    }
    if (tempStr != '') {
        pathStack.push(tempStr);
    }
    let resObj = {};
    if (pathStack.length >= 1) {
        resObj = data;
        for (let i = pathStack.length - 1; i >= 0; i--) {
            let kname = pathStack[i];
            let newobj = JSON.parse(JSON.stringify(resObj));
            if (kname.startsWith('[')) {
                kname = JSON.parse(kname);
                let arr = [];
                arr[kname[0]] = newobj;
                resObj = arr;
            } else {
                if (kname.startsWith('"')) {
                    kname = JSON.parse(kname);
                }
                resObj = {};
                resObj[kname] = newobj;
            }

        }
        return resObj;
    } else return data;

}
function getNbtPathAndContent(nbt) {

    let path = "", data;
    let nbtCache = nbt;
    if (typeof nbt === 'object') {
        let flag = true;
        while (nbtCache != undefined && flag) {

            flag = false;
            let keyTmp = "";
            if (typeof nbtCache !== 'object') break;
            if (Array.isArray(nbtCache)) {
                for (let i = 0; i < nbtCache.length; i++) {
                    if (nbtCache[i] != undefined && flag) {
                        flag = false;
                        break;
                    } else if (nbtCache[i] != undefined) {
                        keyTmp = i;
                        flag = true;
                    }
                }
                if (flag) {
                    path = path + "[" + keyTmp + "]";
                    nbtCache = nbtCache[keyTmp];

                } else {
                    break;
                }
            } else {
                for (let key in nbtCache) {
                    if (nbtCache[key] != undefined && flag) {
                        flag = false;
                        break;
                    } else if (nbtCache[key] != undefined) {
                        keyTmp = (key);
                        flag = true;
                    }

                }
                if (flag) {
                    path = path + "." + warpKey(keyTmp);
                    nbtCache = nbtCache[keyTmp];
                } else {
                    break;
                }
            }
        }
        if (nbtCache != undefined) {
            data = nbtCache;
        }
        try {
            return { path: path, data: NBTools.ToString(data) };

        } catch (e) {
            writeDebugLine(e);
            return { path: path, data: data };

        }
    } else {
        return nbt;
    }
}
function transformDataPathWithArgs(path, type, data) {

    try {
        let nbt = toNbtTextFromPathAndData(path, NBTools.ParseNBT(data));
        switch (type) {
            case 'block':
                nbt = transformBlockTags(nbt)
                break;
            case 'entity':
                nbt = transformEntityTags(nbt)
                break;
            default:
                writeLine("## WARNING: 'storage' will not be transformed because we don't know what to do with it.")
                return { path: path, data: (data) };
        }
        let result = getNbtPathAndContent(nbt);
        if (result.path.startsWith(".")) {
            result.path = result.path.substring(1);
        }
        if (getNbtType(result.data) === 'string') data = warpKey(result.data);
        return result;
    } catch (e) {
        writeDebugLine(e);
        writeLine(`## WARNING: ${e.message}`)
        for (let i in DATAPATH_TRANSFORMATION) {
            let regexp = DATAPATH_TRANSFORMATION[i].regexp;
            let replacement = DATAPATH_TRANSFORMATION[i].replace;
            path = path.replace(regexp, replacement);
        }

    }
    if (getNbtType(data) === 'string') data = warpKey(data);
    return { path: path, data: data };
}
function transformDataPath(path, type) {
    let data = "FLAG";
    if (path.startsWith("{")) {
        switch (type) {
            case 'block':
                return NBTools.ToString(transformBlockTags(NBTools.ParseNBT(path)))
            case 'entity':
                return NBTools.ToString(transformEntityTags(NBTools.ParseNBT(path)))
            default:
                writeLine("## WARNING: 'storage' will not be transformed because we don't know what to do with it.")
                return path;
        }
    } else {
        try {
            let nbt = toNbtTextFromPathAndData(path, data);
            switch (type) {
                case 'block':
                    nbt = transformBlockTags(nbt)
                    break;
                case 'entity':
                    nbt = transformEntityTags(nbt)
                    break;
                default:
                    writeLine("## WARNING: 'storage' will not be transformed because we don't know what to do with it.")
            }
            // console.log(nbt)
            let result = getNbtPathAndContent(nbt);
            if (result.path.startsWith(".")) {
                result.path = result.path.substring(1);
            }

            return result.path;
        } catch (e) {
            writeDebugLine(e);
            for (let i in DATAPATH_TRANSFORMATION) {
                let regexp = DATAPATH_TRANSFORMATION[i].regexp;
                let replacement = DATAPATH_TRANSFORMATION[i].replace;
                path = path.replace(regexp, replacement);
            }
        }

    }

    return path;
}
function dealWithDataCommandArgWithArgs(comArgs, i) {
    var content = null;
    var result = null;
    switch (comArgs[i]) {
        case 'block':
            let x = comArgs[++i];
            let y = comArgs[++i];
            let z = comArgs[++i];
            var path = comArgs[++i];
            result = { result: `block ${x} ${y} ${z}`, type: "block", offset: i, path: path };

            return result;
        case 'entity':
            let target = comArgs[++i];
            target = transformSelector(target);
            var path = comArgs[++i];
            result = { result: `entity ${target}`, type: "entity", offset: i, path: path };

            return result;
        case 'storage':
            let source = comArgs[++i];
            var path = comArgs[++i];
            result = { result: `storage ${source}`, type: "storage", offset: i, path: path };
            return result;
        default:
            return { result: "", offset: i, path: "" };
    }
}
function dealWithDataCommandArgWithoutArgs(comArgs, i) {
    switch (comArgs[i]) {
        case 'block':
            let x = comArgs[++i];
            let y = comArgs[++i];
            let z = comArgs[++i];
            var path = comArgs[++i];
            if (path == undefined) return { result: `block ${x} ${y} ${z}`, offset: i, path: "" };
            path = transformDataPath(path, 'block');
            return { result: `block ${x} ${y} ${z} ${path}`, offset: i, path: path };
        case 'entity':
            let target = comArgs[++i];
            target = transformSelector(target);
            var path = comArgs[++i];
            if (path == undefined) return { result: `entity ${target}`, offset: i, path: "" };
            path = transformDataPath(path, 'entity');
            return { result: `entity ${target} ${path}`, offset: i, path: path };
        case 'storage':
            let source = comArgs[++i];
            var path = comArgs[++i];
            path = transformDataPath(path, 'storage');
            if (path == undefined) return { result: `storage ${source}`, offset: i, path: "" };
            return { result: `storage ${source} ${path}`, offset: i, path: path };
        default:
            return { result: comArgs[i], offset: i, path: "" };
    }
}
function transformCommand(command) {
    if (command == "") return "";
    let comArgs = [];
    try {
        comArgs = parseCommand(command);
        // writeLine(comArgs);

    } catch (error) {
        writeLine("## " + error.name + ": " + error.message);
        writeDebugLine(error);
        return command;
    }
    if (comArgs.length <= 0) {
        writeLine("## " + error.name + ": " + error.message);
        return command;
    }
    let cmdRoot = comArgs[0];
    let cmdRootR = cmdRoot;
    if (cmdRoot.startsWith("/")) cmdRootR = cmdRoot.substring(1);
    else if (cmdRoot.startsWith("$")) {
        writeLine("## WARNING: Macros may be not fully supported yet.")
        cmdRootR = cmdRoot.substring(1);
    }

    try {
        switch (cmdRootR) {
            case 'summon':
                if (comArgs.length < 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                }
                if (comArgs.length < 5) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                    //summon s x y z
                }
                if (comArgs.length == 5) {
                    return command;
                }
                let result = `${comArgs[0]} ${comArgs[1]} ${comArgs[2]} ${comArgs[3]} ${comArgs[4]} ${NBTools.ToString(transformEntityTags(NBTools.ParseNBT(comArgs[5]), comArgs[1]))}`;
                return result;
            case 'clear':
                if (comArgs.length < 2) {
                    return command;
                } else if (comArgs.length == 2) {
                    let selector = transformSelector(comArgs[1]);
                    return `${cmdRoot} ${selector}`;
                } else {
                    let selector = transformSelector(comArgs[1]);
                    // console.log(comArgs[2])
                    let item = transformItem(comArgs[2], "~");
                    let extra = "";
                    if (comArgs.length == 4) {
                        extra = " " + comArgs[3];
                    }
                    return `${cmdRoot} ${selector} ${item}${extra}`;
                }
            case 'setblock':
                //setblock x y z block
                var tmp = "";
                for (let i = 0; i < 4; i++) {
                    if (comArgs[i] == undefined) {
                        writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                        return command;
                    }
                    tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                }
                let block = transformBlock(comArgs[4]);
                tmp += " " + block;

                for (let i = 5; i < comArgs.length; i++) {
                    tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                }
                return `${tmp}`;
                break;
            case 'fill':
                //fill x y z x y z block
                var tmp = "";
                for (let i = 0; i < 7; i++) {
                    if (comArgs[i] == undefined) {
                        writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                        return command;
                    }
                    tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                }
                if (comArgs.length >= 9) {
                    let block = transformBlock(comArgs[7]);
                    tmp += " " + block;
                    if (comArgs[8] == 'replace') {
                        let block2 = comArgs[9];
                        if (block2 != undefined) {
                            block2 = transformBlock(block2);
                            tmp += " replace " + block2;
                        }
                    } else {
                        for (let i = 8; i < comArgs.length; i++) {
                            tmp += (tmp == "" ? "" : " ") + `${comArgs[i]}`;
                        }
                    }
                    return `${tmp}`;
                } else {
                    let block = transformBlock(comArgs[7]);

                    return `${tmp} ${block}`;
                }
                break;
            case 'data':
                let res = "";
                var i = 0;
                res = comArgs[i];
                let type = comArgs[++i];
                switch (type) {
                    case 'get':
                    case 'remove':
                        res += ` ${type} ${dealWithDataCommandArgWithoutArgs(comArgs, ++i).result}`;
                        return res;
                    case 'modify':
                        let tresult = dealWithDataCommandArgWithArgs(comArgs, ++i);
                        let path = tresult.path;
                        i = tresult.offset;
                        let controlType = comArgs[++i];
                        let dresult = null;
                        let data = null;
                        let fromType = "", ress = null;
                        res += ` ${type} ${tresult.result}`;
                        switch (controlType) {
                            case 'set':
                                fromType = comArgs[++i];
                                if (fromType == 'value') {
                                    data = comArgs[++i];
                                    let ress = transformDataPathWithArgs(path, tresult.type, data);
                                    res += ` ${ress.path} ${controlType} ${fromType} ${(ress.data)}`;
                                    break;
                                }
                                if (fromType == 'string') {
                                    writeLine(ERROR_MESSAGES.UNSUPPORTED);
                                    return command;
                                }
                                dresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                                ress = transformDataPathWithArgs(path, tresult.type, "FLAG");
                                writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM)
                                res += ` ${ress.path} ${controlType} ${fromType} ${(dresult.result)}`;

                                break;
                            case 'insert':
                                insertIdx = comArgs[++i];
                                fromType = comArgs[++i];
                                if (fromType == 'value') {
                                    data = comArgs[++i];
                                    let ress = transformDataPathWithArgs(path, tresult.type, [data]);
                                    res += ` ${ress.path} ${controlType} ${insertIdx} ${fromType} ${(ress.data)}`;
                                    break;
                                }
                                if (fromType == 'string') {
                                    writeLine(ERROR_MESSAGES.UNSUPPORTED);
                                    return command;
                                }
                                dresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                                ress = transformDataPathWithArgs(path, tresult.type, "FLAG");
                                writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM)
                                res += ` ${ress.path} ${controlType} ${insertIdx} ${fromType} ${(dresult.result)}`;
                                break;
                            default:
                                transformDataPathWithArgs(path, [data]);
                                fromType = comArgs[++i];
                                if (fromType == 'value') {
                                    data = comArgs[++i];
                                    let ress = transformDataPathWithArgs(path, tresult.type, [data]);
                                    res += ` ${ress.path} ${controlType} ${fromType} ${(ress.data)}`;
                                    break;
                                }
                                if (fromType == 'string') {
                                    writeLine(ERROR_MESSAGES.UNSUPPORTED);
                                    return command;
                                }
                                dresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                                ress = transformDataPathWithArgs(path, tresult.type, "FLAG");
                                writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM)
                                res += ` ${ress.path} ${controlType} ${fromType} ${(dresult.result)}`;
                                break;
                        }

                        return res;
                    case 'merge':
                        writeLine(ERROR_MESSAGES.WARNING_MAY_CAUSE_PROBLEM);
                        let tresult2 = dealWithDataCommandArgWithoutArgs(comArgs, ++i);
                        i = tresult2.offset;
                        res += ` ${type} ${tresult2.result}`;
                        return res;
                    default:
                        throw new SyntaxError(ERROR_MESSAGES.UNKNOWN_ARGUMENTS)
                }
                break;
            case 'execute':
                var tmp = "", i = 0;
                while (i < comArgs.length && comArgs[i] != 'run') {
                    if (comArgs[i] == 'if' || comArgs[i] == 'unless') {
                        let ifOrUnless = comArgs[i];
                        i++;//Skip if or unless
                        let testType = comArgs[i];
                        if (testType == 'data') {
                            i++;
                            let transformResult = dealWithDataCommandArgWithoutArgs(comArgs, i);
                            i = transformResult.offset;
                            let result = transformResult.result;
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType} ` + result;
                        } else if (testType == 'entity') {
                            i++;
                            let selector = transformSelector(comArgs[i]);
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType} ` + selector;
                        } else if (testType == 'block') {
                            let x = comArgs[++i];
                            let y = comArgs[++i];
                            let z = comArgs[++i];
                            let block = transformBlock(comArgs[++i]);
                            let result = `${x} ${y} ${z} ${block}`;
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType} ` + result;
                        } else {
                            tmp += (tmp == "" ? "" : " ") + `${ifOrUnless} ${testType}`;
                        }
                    } else if (comArgs[i] == 'store') {
                        let storeResultType = comArgs[++i]; // result or success
                        let tresult = dealWithDataCommandArgWithoutArgs(comArgs, ++i)
                        tmp += (tmp == "" ? "" : " ") + "store " + storeResultType + " " + tresult.result;
                        i = tresult.offset;
                    } else if (comArgs[i].startsWith("@")) {
                        let selector = transformSelector(comArgs[i]);
                        tmp += (tmp == "" ? "" : " ") + selector;
                    } else {
                        tmp += (tmp == "" ? "" : " ") + comArgs[i];
                    }
                    i++;
                }
                i++; // Skip 'run'
                if (i < comArgs.length) {
                    let executeCommand = "";
                    for (let j = i; j < comArgs.length; j++) {
                        executeCommand += (executeCommand == "" ? "" : " ") + comArgs[j];
                    }
                    tmp += " run " + transformCommand(executeCommand);
                }
                return tmp;
            case 'give':
                if (comArgs.length <= 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                } else {
                    let selector = transformSelector(comArgs[1]);
                    let item = transformItem(comArgs[2]);
                    let extra = "";
                    for (let i = 3; i < comArgs.length; i++) {
                        extra += " " + comArgs[i];
                    }
                    return `${cmdRoot} ${selector} ${item}${extra}`;
                }
            case 'tellraw':
                let selector = transformSelector(comArgs[1]);
                let text = transformTellraw(comArgs[2]);
                return `${cmdRoot} ${selector} ${text}`;
                break;
            case 'item':
                if (comArgs.length <= 2) {
                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                    return command;
                } else {
                    if (comArgs[1] == 'replace') {
                        if (comArgs[2] == 'block') {
                            if (comArgs.length < 8) {
                                writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                return command;
                            }
                            if (comArgs[7] == 'with') {
                                if (comArgs.length < 9) {
                                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                    return command;
                                }
                                let item = transformItem(comArgs[8]);
                                let position = (comArgs[6]);
                                let count = comArgs[9];
                                if (count !== undefined)
                                    return `${cmdRoot} replace block ${comArgs[3]} ${comArgs[4]} ${comArgs[5]} ${position} with ${item} ${count}`;
                                return `${cmdRoot} replace block ${comArgs[3]} ${comArgs[4]} ${comArgs[5]} ${position} with ${item}`;
                            }
                        } else if (comArgs[2] == 'entity') {
                            if (comArgs.length < 6) {
                                writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                return command;
                            }
                            if (comArgs[5] == 'with') {
                                if (comArgs.length < 7) {
                                    writeLine(ERROR_MESSAGES.NOT_ENOUGHT_ARGUMENTS);
                                    return command;
                                }
                                let selector = transformSelector(comArgs[3]);
                                let position = comArgs[4];
                                let item = transformItem(comArgs[6]);
                                let count = comArgs[7];
                                if (count !== undefined)
                                    return `${cmdRoot} replace entity ${selector} ${position} with ${item} ${count}`;
                                return `${cmdRoot} replace entity ${selector} ${position} with ${item}`;
                            }
                        }
                    }


                }
            default:
                // let i = 0;
                let tmpp = "";
                for (let j = 0; j < comArgs.length; j++) {
                    if (comArgs[j].startsWith("@")) {
                        let selector = transformSelector(comArgs[j]);
                        tmpp += (tmpp == "" ? "" : " ") + selector;
                    } else {
                        tmpp += (tmpp == "" ? "" : " ") + comArgs[j];
                    }
                }
                return tmpp;
            // case 'clear':
        }
    } catch (error) {
        writeDebugLine(error);
        writeLine("## Error while transformating command: " + error.message);
    }
    return command;
}
function transformSelector(selectorText) {
    let selector = parseSelectorArg(selectorText);
    let not = false;
    if (selector.components != undefined) for (let i in selector.components) {
        let obj = selector.components[i];
        if (obj.key == 'nbt') {
            let NBTs = obj.value;
            if (NBTs.startsWith("!")) { not = true; NBTs = NBTs.substring(1); }
            else not = false;
            obj.value = (not ? "!" : "") + NBTools.ToString(transformEntityTags(NBTools.ParseNBT(NBTs), "player"));
        }
    }
    // console.log(selector)
    return toSelectorText(selector);
}
function transformEntityItemTag(itemTag) {
    // console.log(itemTag)
    // console.log(itemTag)
    if (itemTag == null) return {};
    let id = itemTag.id;
    let rawid = getNbtContent(id);
    let count = getNbtContent(itemTag.count);
    let tag = itemTag.components;
    let slot = itemTag.Slot;
    let components = null;
    let result = { id: id, count: count };
    if (tag != undefined) {
        // console.log(tag)
        components = transformItemTags(tag, rawid);
        result['components'] = {};
        for (var key in components) {
            result['components'][(key)] = components[key];
        }
    }
    if (slot != undefined) {
        result['Slot'] = slot;
    }

    return result;
}

function transformBlockItemTag(blockItemArrays) {
    let result = [];
    for (let i in blockItemArrays) {
        if (blockItemArrays[i] == null) result.push(null)
        else result.push(transformEntityItemTag(blockItemArrays[i]));
    }
    return result;
}
function transformBlock(blockText) {
    let item = parseItemArg(blockText);
    // console.log(NBTools.ToString(item.tags))
    if (item.components != null) {
        return blockText;
    }
    if (item.tags != null) {
        let transformedTags = transformBlockTags(item.tags);
        item.tags = transformedTags;
    }
    return toItemText(item);
}
function transformItem(itemText, splitChar = '=') {
    // console.log(itemText)
    let item = parseItemArg(itemText);

    // console.log(NBTools.ToString(item.tags))
    if (item.tags != null && item.tags != "") {
        // return itemText;
        writeLine("## WARNING: Your commands shouldn't bring 'tags' in 1.21.4");
    }
    if (item.components != null) {
        let transformedComponent = transformItemTags(item.components, item.id);
        item.components = transformedComponent;
        item.tags = undefined;
    }
    return toItemText(item, splitChar);
}
function transformBlockTags(tag) {
    if (tag['Items'] != undefined) {
        tag['Items'] = transformBlockItemTag(tag['Items']);
    }
    if (tag['CustomName'] != undefined) {
        tag['CustomName'] = NBTStringParse(tag['CustomName']);
    }
    // if(tag[''])
    // if (tag['FlowerPos'] != undefined) {
    //     tag['flower_pos'] = transformBlockItemTag(tag['FlowerPos']);
    //     delete tag['FlowerPos'];
    // }
    // if (tag['ExitPortal'] != undefined) {
    //     tag['exit_portal'] = transformBlockItemTag(tag['ExitPortal']);
    //     delete tag['ExitPortal'];
    // }
    return tag;
}
function transformEntityTags(tag, entityId = undefined) {
    // console.log(tag)
    if (tag['FireworksItem'] != undefined) {
        tag['FireworksItem'] = transformEntityItemTag(tag['FireworksItem']);
    }
    if (tag['ArmorItems'] != undefined) {
        let position = ["feet", "legs", "chest", "head"]
        if (tag['equipment'] == null)
            tag['equipment'] = {}
        for (let i in tag['ArmorItems']) {
            if (tag['ArmorItems'][i] != null) if (JSON.stringify(tag['ArmorItems'][i]) != "{}")
                tag['equipment'][position[i]] = transformEntityItemTag(tag['ArmorItems'][i]);
        }
        delete tag['ArmorItems'];
    }
    if (tag['DecorItem'] != undefined) {
        tag['DecorItem'] = transformEntityItemTag(tag['DecorItem']);
    }
    if (tag['HandItems'] != undefined) {
        let position = ["mainhand", "offhand"]
        if (tag['equipment'] == null)
            tag['equipment'] = {}
        for (let i in tag['HandItems']) {
            if (tag['HandItems'][i] != null) if (JSON.stringify(tag['HandItems'][i]) != "{}")
                tag['equipment'][position[i]] = transformEntityItemTag(tag['HandItems'][i]);
        }
        delete tag['HandItems'];
    }
    if (tag['ArmorDropChances']) {
        let position = ["feet", "legs", "chest", "head"]

        if (tag['drop_chances'] == null)
            tag['drop_chances'] = {}
        for (let i in tag['ArmorDropChances']) {
            if (tag['ArmorDropChances'][i] != null) if (JSON.stringify(tag['ArmorDropChances'][i]) != "{}")
                tag['drop_chances'][position[i]] = (tag['ArmorDropChances'][i]);
        }
        delete tag['ArmorDropChances'];
    }
    if (tag['HandDropChances']) {
        let position = ["mainhand", "offhand"]

        if (tag['drop_chances'] == null)
            tag['drop_chances'] = {}
        for (let i in tag['HandDropChances']) {
            if (tag['HandDropChances'][i] != null) if (JSON.stringify(tag['HandDropChances'][i]) != "{}")
                tag['drop_chances'][position[i]] = (tag['HandDropChances'][i]);
        }
        delete tag['HandDropChances'];
    }

    if (tag['CustomName'] != undefined) {
        tag['CustomName'] = NBTStringParse(tag['CustomName']);
    }
    if (tag['text'] != undefined) {
        tag['text'] = NBTStringParse(tag['text']);
    }

    // if (tag['FlowerPos'] != undefined) {
    //     tag['hive_pos'] = tag['FlowerPos'];
    //     delete tag['FlowerPos'];
    // }
    // if (tag['HivePos'] != undefined) {
    //     tag['flower_pos'] = tag['HivePos'];
    //     delete tag['HivePos'];
    // }

    // if (tag['PatrolTarget'] != undefined) {
    //     tag['patrol_target'] = tag['PatrolTarget'];
    //     delete tag['PatrolTarget'];
    // }
    // if (tag['WanderTarget'] != undefined) {
    //     tag['wander_target'] = tag['WanderTarget'];
    //     delete tag['WanderTarget'];
    // }
    // if (tag['Leash'] != undefined) {
    //     tag['leash'] = tag['Leash'];
    //     delete tag['Leash'];
    // }
    if (tag['Item'] != undefined) {
        tag['Item'] = transformEntityItemTag(tag['Item']);
    }
    // writeDebugLine(tag)
    if (tag['Inventory'] != undefined) {
        tag['Inventory'] = transformBlockItemTag(tag['Inventory'])
    }
    if (tag['SelectedItem'] != undefined) {
        tag['SelectedItem'] = transformEntityItemTag(tag['SelectedItem'])
    }
    return tag;
}
function hideComponentsInTooltip(components, key) {
    if (components['minecraft:tooltip_display'] == null) {
        components['minecraft:tooltip_display'] = { hidden_components: [] };
    }
    if (components['minecraft:tooltip_display']["hidden_components"] == null) {
        components['minecraft:tooltip_display']["hidden_components"] = [];
    }
    if (key == 'hide_tooltip') {
        components['minecraft:tooltip_display']['hide_tooltip'] = true;
    }
    if (Array.isArray(key)) {
        for (let i = 0; i < key.length; i++) {
            components['minecraft:tooltip_display']["hidden_components"].push(key[i]);
        }
    } else
        components['minecraft:tooltip_display']["hidden_components"].push(key);
}
function NBTStringParse(text) {
    if (typeof text == 'object') return text;
    let res = "";
    if (text.startsWith("'")) {
        text = text.replaceAll('"', "\\\"");
        res = transformTellraw(JSON.parse('"' + text.substring(1, text.length - 1) + '"'));
    } else if (text.startsWith('"')) {
        // console.log(text)

        res = transformTellraw(JSON.parse(text), text);
    } else {
        res = text;
    }
    if (res == null) return "";
    return res;
}
function transformItemTags(tag, itemId = undefined) {
    let components = {};
    // console.log(1)

    for (let key in tag) {
        let simplestKey = deleteNameSpace(key);
        // console.log(simplestKey)

        switch (simplestKey) {
            case 'custom_name':
            case 'item_name':
                components[key] = NBTStringParse(tag[key]);
                break;
            case 'lore':
                components[key] = [];
                for (let i = 0; i < tag[key].length; i++) {
                    components[key][i] = NBTStringParse(tag[key][i]);
                }
                break;
            case 'attribute_modifiers':
                if (tag[key]['modifiers'] != null)
                    components[key] = tag[key]['modifiers'];
                if (tag[key]['show_in_tooltip'] == false) {
                    hideComponentsInTooltip(components, key);
                }
                break;
            case 'dyed_color':
                if (tag[key]['rgb'] != null)
                    components[key] = tag[key]['rgb'];
                if (tag[key]['show_in_tooltip'] == false) {
                    hideComponentsInTooltip(components, key);
                }
                break;
            case 'enchantments':
            case 'stored_enchantments':
                if (tag[key]['levels'] != null)
                    components[key] = tag[key]['levels'];
                if (tag[key]['show_in_tooltip'] == false) {
                    hideComponentsInTooltip(components, key);
                }
                break;
            case 'trim':
            case 'jukebox_playable':
            case 'unbreakable':
                if (tag[key]['show_in_tooltip'] == false) {
                    hideComponentsInTooltip(components, key);
                    delete tag[key]['show_in_tooltip'];
                }
                components[key] = tag[key];
                break;
            case 'weapon':
                components['weapon'] = tag[key];
                components["item_damage_per_attack"] = components["damage_per_attack"];
                delete components["damage_per_attack"];
                break;
            case 'can_break':
            case 'can_place_on':
                if (tag[key]['predicates'] != null)
                    components[key] = tag[key]['predicates'];
                if (tag[key]['show_in_tooltip'] == false) {
                    hideComponentsInTooltip(components, key);
                }

                break;
            case 'hide_additional_tooltip':
                hideComponentsInTooltip(components, ['potion_contents', 'potion_duration_scale']);
                break;
            case 'hide_tooltip':
                hideComponentsInTooltip(components, "hide_tooltip");
                break;
            case 'fire_resistant':
                writeLine("## WARNING: NOT SUPPORTED YET FOR '" + key + "'.")
            default:
                // console.log(simplestKey)
                if (components[key] === undefined) components[key] = {};
                components[key] = tag[key];
            // console.log(key)
            // Put it into custom_data
        }
    }

    return components;
}
function modifyLootTableTree(data) {
    for (let i in data) {
        if (i === 'functions') {
            let itemid = data['name'];
            if (itemid == null) itemid = "air";
            else itemid = itemid + "";
            for (let j in data[i]) {
                let functionType = data[i][j]['function'];
                if (deleteNameSpace(functionType) == 'set_components') {
                    let nbt = data[i][j]['components'];
                    try {
                        let components = transformItemTags(NBTools.ParseNBT(nbt), itemid);
                        data[i][j]['components'] = {}
                        for (let k in components) {
                            data[i][j]['components'][k] = NBTools.ToJSON(components[k]);

                        }
                    } catch (e) {
                        writeDebugLine(e);
                    }

                }
            }
        } else {
            if (typeof data[i] === 'object')
                modifyLootTableTree(data[i]);
        }
    }
}
function transformJSON(data) {
    try {
        let dat = JSON.parse(data);
        if (dat['pools'] != null) {
            modifyLootTableTree(dat['pools']);
            return JSON.stringify(dat, null, "    ");
        } else {
            return data;
        }
    } catch (e) {
        writeDebugLine(e);
    }
    return data;
}
module.exports = { transformId, transformJSON, transformCommand }

},{"../ErrorMessages.js":1,"../NBTool.js":3,"../inputSystem.js":5,"../mccommand.js":6}]},{},[4]);
