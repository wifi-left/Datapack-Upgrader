const NBTools = require("./NBTool.js").NBTools;
function parseCommand(cmd) {
    if (cmd.startsWith("#")) return [cmd];
    if (typeof (cmd) != "string") throw SyntaxError("非文本对象");
    return splitText(cmd, " ");
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
                    throw SyntaxError("字符串的中括号不成对");
                }
            } else if (text[i] == '}') {
                if (stack[stack.length - 1] == '{') { tempStr += text[i]; stack.pop(); }
                else throw SyntaxError("字符串的大括号不成对");
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
        switch (stack[0]) {
            case '"':
                throw SyntaxError("字符串的双引号不成对");
                break;
            case '[':
                throw SyntaxError("字符串的中括号不成对");
                break;
            case '{':
                throw SyntaxError("字符串的大括号不成对");
                break;
            case "'":
                throw SyntaxError("字符串的单引号不成对");
                break;
            default:
                throw SyntaxError("无法匹配“" + stack[0] + "”");
        }
    }
    if (fanXieGang > 0) {
        throw SyntaxError("转义错误。");
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
                throw SyntaxError("键名为空");
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
                    throw SyntaxError("字符串的中括号不成对");
                }
            } else if (text[i] == '}') {
                if (stack[stack.length - 1] == '{') { tempStr += text[i]; stack.pop(); }
                else throw SyntaxError("字符串的大括号不成对");
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
        switch (stack[0]) {
            case '"':
                throw SyntaxError("字符串的双引号不成对");
                break;
            case '[':
                throw SyntaxError("字符串的中括号不成对");
                break;
            case '{':
                throw SyntaxError("字符串的大括号不成对");
                break;
            case "'":
                throw SyntaxError("字符串的单引号不成对");
                break;
            default:
                throw SyntaxError("无法匹配“" + stack[0] + "”");
        }
    }
    if (fanXieGang > 0) {
        throw SyntaxError("转义错误");
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
                    throw SyntaxError("字符串的中括号不成对");
                }
                if (stack.length == 0) {
                    components = tempStr;
                    tempStr = '';
                }
            } else if (text[i] == '}') {
                if (stack[stack.length - 1] == '{') { tempStr += text[i]; stack.pop(); }
                else throw SyntaxError("字符串的大括号不成对");
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
        switch (stack[0]) {
            case '"':
                throw SyntaxError("字符串的双引号不成对");
                break;
            case '[':
                throw SyntaxError("字符串的中括号不成对");
                break;
            case '{':
                throw SyntaxError("字符串的大括号不成对");
                break;
            case "'":
                throw SyntaxError("字符串的单引号不成对");
                break;
            default:
                throw SyntaxError("无法匹配“" + stack[0] + "”");
        }
    }
    if (fanXieGang > 0) {
        throw SyntaxError("转义错误。");
    }
    tags = tempStr;
    return { tags: tags, components: components };
}
function parseSelectorArg(selector) {
    let idx = selector.indexOf("[");
    if (idx == -1) return { mode: selector };
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
function parseBlockArg(Block) {

}
function parseComponents(components) {
    if (components == "" || components == null) return null;
    if (components.startsWith("[") && components.endsWith("]")) {
        components = components.substring(1, components.length - 1);
    }
    return parseValues(components, ",", "=");
}
function toItemText(itemObj) {
    let id = itemObj.id;
    let components = "";
    let tag = "";
    if (itemObj.components != null) {
        for (let key in itemObj.components) {
            components += (components == "" ? "" : ",") + `${key}=${NBTools.ToString(itemObj.components[key])}`;
        }
        components = `[${components}]`
    }

    let result = `${id}${components}${tag}`;
    return result;
}




module.exports = { parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues, parseComponents, toItemText, deleteNameSpace }
