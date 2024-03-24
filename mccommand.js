const NBTools = require("./NBTool.js").NBTools;
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
    if (name.startsWith("minecraft:")) return name.substring("minecraft:".length);
    return name;
}
function splitText(text, separator) {
    var stack = [];
    var tempStr = '';
    var cmds = [];
    var fanXieGang = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] == separator && stack.length <= 0) {
            cmds.push(tempStr);
            tempStr = '';
        } else if (text[i] == "\"" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "\"") stack.pop()
            else stack.push("\"");
        } else if (text[i] == "'" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "'") stack.pop()
            else stack.push("'");
        } else if (stack[stack.length - 1] != '"' && stack[stack.length - 1] != "'") {
            if (text[i] == '[') {
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
    cmds.push(tempStr);
    return cmds;
}
function parseValues(text, separator, equalsChar) {
    var stack = [];
    var tempStr = '';
    var cmds = {};
    let keyName = '';
    var fanXieGang = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] == equalsChar && stack.length <= 0) {
            keyName = tempStr;
            if (keyName == '') {
                throw SyntaxError("Empty keyName.");
            }
            tempStr = '';
        } else if (text[i] == separator && stack.length <= 0) {
            cmds[keyName] = tempStr;
            tempStr = '';
            keyName = null;
        } else if (text[i] == "\"" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "\"") stack.pop()
            else stack.push("\"");
        } else if (text[i] == "'" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "'") stack.pop()
            else stack.push("'");
        } else if (stack[stack.length - 1] != '"' && stack[stack.length - 1] != "'") {
            if (text[i] == '[') {
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
    if (keyName != '') {
        cmds[keyName] = tempStr;
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
    for (var i = 0; i < text.length; i++) {
        if (text[i] == "\"" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "\"") stack.pop()
            else stack.push("\"");
        } else if (text[i] == "'" && fanXieGang == 0) {
            tempStr += text[i];
            if (stack[stack.length - 1] == "'") stack.pop()
            else stack.push("'");
        } else if (stack[stack.length - 1] != '"' && stack[stack.length - 1] != "'") {
            if (text[i] == '[') {
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
    tags = tempStr;
    return { tags: tags, components: components };
}
function parseSelectorArg(selector) {
    let idx = selector.indexOf("[");
    if (idx == -1) return { player: selector };
    let idy = selector.lastIndexOf("]");
    let target = selector.substring(0, idx);
    let tag = selector.substring(idx + 1, idy);
    let tags = parseValues(tag, ",", "=");

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
        components = components.substring(1, components.length - 1);
    }
    return parseValues(components, ",", "=");
}
function toSelectorText(selectorObj, splitChar = '='){
    let id = selectorObj.player;
    let components = "";
    if (selectorObj.components != null) {
        for (let key in selectorObj.components) {
            components += (components == "" ? "" : ",") + `${key}${splitChar}${NBTools.ToString(selectorObj.components[key])}`;
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
    if(itemObj.tags != undefined){
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




module.exports = { parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues, parseComponents, toItemText, deleteNameSpace, defaultOrValue,toSelectorText }
