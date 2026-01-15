const { writeLine, writeDebugLine, Settings } = require("../inputSystem.js");
const { ERROR_MESSAGES } = require("../ErrorMessages.js");
const { defaultOrValue, parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, toItemText, deleteNameSpace, toSelectorText } = require("../mccommand.js");
const { NBTools, getNbtContent, warpKey, getNbtType } = require("../NBTool.js");
const pathLib = require("path");
var idx = 0;
var keytmp = {};
let MacOSMode = false;
const DATAPATH_TRANSFORMATION = [];
function transformId(array, id) {
    let res = array[id];
    if (res == undefined || res == "") return id;
    return res;
}
function modifyAdvancementTree(data) {
    data['title'] = NBTools.ToJSON(transformRawMsg(data['title']));
    data['description'] = NBTools.ToJSON(transformRawMsg(data['description']));
    return data;
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
        } else if (dat['display'] != null) {
            modifyAdvancementTree(dat['display']);
            return JSON.stringify(dat, null, "    ");
        } else {
            return data;
        }
    } catch (e) {
        writeDebugLine(e);
    }
    return data;
}
function transformTellraw(text, fallback = "\"\"") {
    let d = text;

    try {
        d = NBTools.ParseNBT(d);
    } catch (e) {
        d = NBTools.ParseNBT(fallback);
    }
    return NBTools.ToString(transformRawMsg(d));
}
function transformClickEvent(data) {
    if (getNbtContent(data['action']) == 'run_command') {
        data['command'] = warpKey(transformCommand(getNbtContent(data['command']), false));
    }
    return data;
}
function transformHoverEvent(data) {
    if (getNbtContent(data['action']) == 'show_text') {
        if (data['contents'] != null) {
            data['value'] = transformRawMsg(data['value']);
        }
    }
    return data;
}
function transformText(text) {
    // console.log(text);
    if (text == null);
    if ((text + "") == '##!##FLAG##!##') return;
    if ((text + "").trim() == "") return text;
    text = warpPercent(text);

    if (Settings.noRepeat) {
        if (keytmp[text] != null) {
            return keytmp[text];
        }
    }

    let rpath = Settings.relativeFilePath;
    const regu = /^[0-9_a-z.]+$/;
    if (rpath != null) {
        rpath = rpath.replaceAll(" ", "_");
        rpath = rpath.replaceAll("/", ".");
        if (!(regu.test(rpath))) {
            rpath = pathLib.basename(Settings.relativeFilePath);
        }

    } else {
        rpath = pathLib.basename(Settings.relativeFilePath);
    }
    rpath = rpath.replaceAll(".mcfunction", "");
    rpath = rpath.replaceAll(".json", "");
    rpath = rpath.replaceAll("data.", "");

    do {
        idx++;
        keyname = "mt." + rpath + ".key_" + idx;
    } while (Settings.result[keyname] != null)

    if (Settings.noRepeat) {
        keytmp[text] = keyname;
    }
    Settings.result[keyname] = getNbtContent(text);
    return keyname;
}
function warpPercent(textS) {

    let text = textS.replaceAll("%s", "§Ž");
    text = text.replaceAll("%", "%%");
    text = text.replaceAll("§Ž", "%s");
    return text;
}
function transformRawMsg(data) {
    if (data == null) return "";
    if (data == "##!##FLAG##!##") return "";
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = transformRawMsg(data[i]);
        }
        return data;
    } else if (typeof data === 'object') {
        if (data['click_event'] != null) {
            data['click_event'] = transformClickEvent(data['click_event']);
        }
        if (data['hover_event'] != null) {
            data['hover_event'] = transformHoverEvent(data['hover_event']);
        }
        if (data['extra'] != null) {
            data['extra'] = transformRawMsg(data['extra']);
        }
        if (data['selector'] != null) {
            data['selector'] = warpKey(transformSelector(getNbtContent(data['selector'])));
        }
        if (data['translate'] != null) {
            let keyname = getNbtContent(data['translate']);
            if (data['fallback'] != null) {
                Settings.result[keyname] = getNbtContent(data['fallback']);
            }
            else {
                Settings.result[keyname] = getNbtContent(data['translate']);
            }
        }
        if (data['text'] != null) {
            if (MacOSMode) {
                const regex = /\$\([a-zA-Z0-9_]+\)/g;
                let arr = data['text'].match(regex);
                data['text'] = data['text'].replace(regex, "%s");
                if (arr.length > 0) {
                    data['with'] = arr;
                }
            }

            data['translate'] = transformText(data['text']);
            data['fallback'] = warpPercent(data['text']);
            delete data['text'];
        }
        return data;
    } else {
        if (getNbtContent(data).trim() == '') return data;
        let withC = []
        if (typeof data === 'string' && MacOSMode) {
            const regex = /\$\([a-zA-Z0-9_]+\)/g;
            let arr = data.match(regex);
            data = data.replace(regex, "%s");
            if (arr != null) if (arr.length > 0) {
                withC = arr;
            }
        }
        if (withC.length > 0)
            data = { fallback: warpPercent(data), translate: (transformText(data)), with: withC };
        else
            data = { fallback: warpPercent(data), translate: (transformText(data)) };
        return (data);
    }
}
function toNbtTextFromPathAndData(path, data = "") {
    // console.log(path)
    if (path == null) return data;
    if (path == "") return data;
    if (path == "{}") return data;
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
            } else if (text[i] == '{') {
                pathStack.push(tempStr)

                tempStr = text[i];
                // if (stack[stack.length-1] == '"') stack.pop()
                stack.push('{');
                for (i = i + 1; i < text.length && stack[stack.length - 1] == '{'; i++) {
                    // console.log(tempStr)
                    if (text[i] == '}') {
                        tempStr += text[i]; stack.pop();
                    } else if (text[i] == '{') {
                        tempStr += text[i]; stack.push('{');
                    } else {
                        tempStr += text[i];
                    }
                }
                pathStack.push(tempStr);
                continue;

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
    // console.log(pathStack)
    let resObj = {};
    if (pathStack.length >= 1) {
        resObj = data;
        for (let i = pathStack.length - 1; i >= 0; i--) {
            let kname = pathStack[i];
            if (kname == '') continue;
            // console.log(kname)
            let newobj = JSON.parse(JSON.stringify(resObj));

            if (kname.startsWith('[')) {
                kname = JSON.parse(kname);
                let arr = [];
                arr[kname[0]] = newobj;
                resObj = arr;
            } else if (kname.startsWith('{')) {
                kname = NBTools.ParseNBT(kname);
                resObj = kname;
            } else {
                if (kname.startsWith('"')) {
                    kname = JSON.parse(kname);
                }
                resObj = {};
                resObj[kname] = newobj;
            }

        }
        // console.log(resObj)
        return resObj;
    } else return data;

}
function getNbtPathAndContent(nbt) {
    // console.log(nbt)
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
        return { path: "", data: nbt };
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
        if (result.path == "") result.path = "{}";
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
    let data = "##!##FLAG##!##";
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
        let flag = false;
        if (path.endsWith("}")) flag = true;
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
            if (flag) return NBTools.ToString(nbt);
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
function transformCommand(command, newLine = true) {
    if (newLine)
        MacOSMode = false;
    if (command == "") return "";
    if (command.startsWith("#")) return command;

    let comArgs = [];
    try {
        comArgs = parseCommand(command);
        // writeLine(comArgs);
        // console.log(comArgs[2])
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
        if (newLine)
            MacOSMode = true;
        writeLine("## WARNING: Macros not fully supported yet.")
        // return command;
        writeLine("# Original Command: " + command);
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
                    let item = transformItem(comArgs[2], null);
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
            case 'team':
                var i = 0;
                if (comArgs[++i] == 'modify') {
                    let team_name = comArgs[++i];
                    let team_modify_type = comArgs[++i];
                    if (["prefix", "suffix"].includes(team_modify_type)) {
                        let text = transformTellraw(comArgs[++i]);
                        return `${comArgs[0]} modify ${team_name} ${team_modify_type} ${text}`;
                    } else {
                        return command;
                    }

                } else {
                    return command;
                }
            case 'scoreboard':
                var i = 0;
                if (comArgs[++i] == 'players') if (comArgs[++i] == 'display') if (comArgs[++i] == 'name') {
                    let scb_name = comArgs[++i];
                    let scb_obj = comArgs[++i];
                    let text = transformTellraw(comArgs[++i]);
                    return `${comArgs[0]} players display name ${scb_name} ${scb_obj} ${text}`;

                } else {
                    return command;
                }
            case 'bossbar':
                var i = 0;
                if (comArgs[++i] == 'set') {
                    let bossbar_name = comArgs[++i];
                    if (comArgs[++i] == 'name') {
                        let text = transformTellraw(comArgs[++i]);
                        return `${comArgs[0]} set ${bossbar_name} name ${text}`;
                    } else {
                        return command;
                    }
                } else {
                    return command;
                }
                break;
            case 'data':
                let res = "";
                var i = 0;
                res = comArgs[i];
                let type = comArgs[++i];
                switch (type) {
                    case 'remove':
                        res += ` ${type} ${dealWithDataCommandArgWithoutArgs(comArgs, ++i).result}`;
                        return res;
                    case 'get':
                        let fuck = dealWithDataCommandArgWithoutArgs(comArgs, ++i)
                        i = fuck.offset;
                        let mutiply = comArgs[++i];
                        res += ` ${type} ${fuck.result}${(mutiply == "" || mutiply == null ? "" : " " + mutiply)}`;
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
                                ress = transformDataPathWithArgs(path, tresult.type, "##!##FLAG##!##");
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
                                ress = transformDataPathWithArgs(path, tresult.type, "##!##FLAG##!##");
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
                                ress = transformDataPathWithArgs(path, tresult.type, "##!##FLAG##!##");
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
                    tmp += " run " + transformCommand(executeCommand, false);
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
            case 'title':
                let selectort = transformSelector(comArgs[1]);
                let ttype = comArgs[2];
                switch (ttype) {
                    case 'title':
                    case 'subtitle':
                    case 'actionbar':
                        let textt = transformTellraw(comArgs[3]);
                        return `${cmdRoot} ${selectort} ${ttype} ${textt}`;
                    default:
                        return command;
                }
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
            let tkey = key;
            result['components'][tkey] = components[key];
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

    if (item.tags != null) {
        let transformedTags = transformBlockTags(item.tags);
        item.tags = transformedTags;
    }
    return toItemText(item);
}
function transformItem(itemText, splitChar = null) {
    // console.log(itemText)
    let item = parseItemArg(itemText);
    // console.log(NBTools.ToString(item.tags))
    if (item.tags != null && item.tags != "") {
        // return itemText;
        writeLine("## WARNING: Your commands shouldn't bring 'tags' in 1.20.5 and later");
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
        tag['CustomName'] = transformRawMsg(tag['CustomName']);
    }

    if (tag['front_text'] != undefined) {
        if (tag['front_text']['messages'] != undefined) {
            for (let i = 0; i < tag['front_text']['messages'].length; i++) {
                tag['front_text']['messages'][i] = transformRawMsg(tag['front_text']['messages'][i]);
            }
        }
    }
    if (tag['back_text'] != undefined) {
        if (tag['back_text']['messages'] != undefined) {
            for (let i = 0; i < tag['back_text']['messages'].length; i++) {
                tag['back_text']['messages'][i] = transformRawMsg(tag['back_text']['messages'][i]);
            }
        }
    }
    if (tag['Command'] != undefined) {
        tag['Command'] = warpKey(transformCommand(getNbtContent(tag['Command']), false));
    }

    return tag;
}
function transformEntityTags(tag, entityId = undefined) {
    // console.log(tag)
    if (tag['FireworksItem'] != undefined) {
        tag['FireworksItem'] = transformEntityItemTag(tag['FireworksItem']);
    }
    if (tag['DecorItem'] != undefined) {
        tag['DecorItem'] = transformEntityItemTag(tag['DecorItem']);
    }
    if (tag['equipment'] != undefined) {
        for (let i in tag['equipment']) {
            tag['equipment'][i] = transformEntityItemTag(tag['equipment'][i]);
        }
    }

    if (tag['CustomName'] != undefined) {
        tag['CustomName'] = transformRawMsg(tag['CustomName']);
    }
    if (tag['text'] != undefined) {
        tag['text'] = transformRawMsg(tag['text']);
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

    if (tag['Passengers'] != undefined) {
        for (let i = 0; i < tag['Passengers'].length; i++) {
            let PassengersEntityId = tag['Passengers'][i]['id'];
            tag['Passengers'][i] = transformEntityTags(tag['Passengers'][i], PassengersEntityId);
        }
    }

    return tag;
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
        if (simplestKey.startsWith("!")) {
            simplestKey = simplestKey.substring(1);
        }
        switch (simplestKey) {
            case 'custom_name':
            case 'item_name':
                components[key] = transformRawMsg(tag[key]);
                break;
            case 'lore':
                components[key] = [];
                for (let i = 0; i < tag[key].length; i++) {
                    components[key][i] = transformRawMsg((tag[key][i]));
                }
                break;
            case 'written_book_content':
                components[key] = tag[key];
                let p = components[key]['pages'];
                for (let i = 0; i < p.length; i++) {
                    if (p[i].raw != undefined) {
                        let t = transformRawMsg(p[i].raw);
                        p[i].raw = t;
                    } else {
                        p[i] = transformRawMsg(p[i]);
                    }
                }
                components[key]['pages'] = p;
                break;
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
module.exports = { transformId, transformCommand, transformJSON, transformRawMsg, transformEntityTags, transformBlockTags, transformItemTags }