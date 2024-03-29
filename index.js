const { defaultOrValue, parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues, toItemText, deleteNameSpace, toSelectorText } = require("./mccommand.js");
const { transformId, ENCHANTMENTS_TRANSFORMATION, ARRTIBUTEOPERATION_TRANSFORMATION, ITEMSLOT_TRANSFORMATION, FIREWORK_TRANSFORMATION, FLAGSCOLOR_TRANSFORMATION, DATAPATH_TRANSFORMATION } = require("./transformations.js");
const { ERROR_MESSAGES } = require("./ErrorMessages.js");
const fs = require("fs");
const package = require("./package.json")
const pathLib = require('path')

console.warn("###")
console.warn("### Datapack Upgrader v" + package.version + " by " + package.author)
console.warn("### If you encounter a problem, make a issue on " + package.homepage)
console.warn("### ")
const { NBTools, getNbtContent, getNbtType, warpKey } = require("./NBTool.js");
var OutputFile = null;
var debugMode = false;
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        if (OutputFile != null) {
            OutputFile.write(lines[i] + "\r\n");
        } else {
            console.log(lines[i])
        }
    }
}
function writeDebugLine(...lines) {
    if (!debugMode) return;
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i])
    }
}
let argvs = process.argv;
let i = 0;
while (i < argvs.length) {
    let arg = argvs[i];
    if (arg == '-debug') {
        debugMode = true;
    }
    if (arg == '-c') {
        i++;
        if (i < argvs.length) {
            let arrs = argvs[i].split("\\n");
            for (let j = 0; j < arrs.length; j++)
                writeLine(transformCommand(arrs[j]));
        }
    } else if (arg == '-O') {

        i++;
        if (i < argvs.length) {
            let path = argvs[i];
            let force = false;
            i++;
            if (i < argvs.length) {
                if (argvs[i] == '-y') {
                    force = true;
                }
            }
            try {
                writeDebugLine("## DEBUG: Save file to '" + path + "'")
                let dir = pathLib.dirname(path)
                if(!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                if (fs.existsSync(path)) {
                    if (!force) {
                        console.error("## ERROR: The file '" + path + "' already exists. Use '-y' after file path to force write the file.")
                        continue;
                    } else {
                        fs.rmSync(path);
                    }
                }
                if (OutputFile != null) {
                    OutputFile.end();
                }
                OutputFile = fs.createWriteStream(path, { encoding: "utf8" });
            } catch (error) {
                console.error("## Error while writing file: " + error.message)
                writeDebugLine(error);
                continue;
            }
        }
    } else if (arg == '-I') {
        i++;
        if (i < argvs.length) {
            let path = argvs[i];
            let content = "";
            try {
                console.info("# Reading file '" + path + "'")
                content = fs.readFileSync(path, { encoding: "utf8" });
            } catch (error) {
                console.error("## Error while reading file: " + error.message)
                writeDebugLine(error);
                continue;
            }
            let arrs = content.replace("\r", "").split("\n");
            for (let j = 0; j < arrs.length; j++)
                writeLine(transformCommand(arrs[j].trim()));
        }
    }
    i++;
}
if (OutputFile != null) {
    OutputFile.end();
}

function transformDataPath(path, type) {
    if (path.startsWith("{")) {
        switch (type) {
            case 'block':
                return transformBlockTags(path)
            case 'entity':
                return transformBlockTags(path)
            default:
                return transformEntityTags(transformBlockTags(path, ""));
        }
    }
    for (let i in DATAPATH_TRANSFORMATION) {
        let regexp = DATAPATH_TRANSFORMATION[i].regexp;
        let replacement = DATAPATH_TRANSFORMATION[i].replace;
        path = path.replace(regexp, replacement);
    }
    return path;
}
function dealWithDataCommandArg(comArgs, i) {
    switch (comArgs[i]) {
        case 'block':
            let x = comArgs[++i];
            let y = comArgs[++i];
            let z = comArgs[++i];
            var path = comArgs[++i];
            path = transformDataPath(path, 'block');
            return { result: ``, offset: i, path: path };
        case 'entity':
            let target = comArgs[++i];
            transformSelector(target);
            var path = comArgs[++i];
            path = transformDataPath(path, 'entity');
            return { result: ``, offset: i, path: path };
        case 'storage':
            let source = comArgs[++i];
            var path = comArgs[++i];
            path = transformDataPath(path, 'storage');
            return { result: ``, offset: i, path: path };
        default:
            return { result: "", offset: i, path: "" };
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
                    writeLine("## WARNING: Particle 'entity_effect' takes color argument when spawned from command '/particle entity_effect <r> <g> <b> <a>'.")
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
            case 'execute':
                var tmp = "", i = 0;
                while (i < comArgs.length && comArgs[i] != 'run') {
                    if (comArgs[i] == 'if' || comArgs[i] == 'unless') {
                        let ifOrUnless = comArgs[i];
                        i++;//Skip if or unless
                        let testType = comArgs[i];
                        if (testType == 'data') {
                            i++;
                            let transformResult = dealWithDataCommandArg(comArgs, i);
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
                        }
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
                    return `${cmdRoot} ${selector} ${item}`;
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
                                let position = transformId(ITEMSLOT_TRANSFORMATION, comArgs[7]);
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
    if (selector.components != undefined) if (selector.components.nbt != undefined) selector.components.nbt = transformEntityTags(NBTools.ParseNBT(selector.components.nbt), "player");

    // console.log(selector)
    // TODO: 转换 selector 中 nbt
    return toSelectorText(selector);
}
function transformEntityItemTag(itemTag) {
    let id = itemTag.id;
    let count = getNbtContent(itemTag.Count);
    let tag = itemTag.tag;
    let slot = itemTag.Slot;
    let components = null;
    let result = { id: id, count: count };
    if (tag != undefined) {
        components = transformItemTags(tag);
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
    let count = getNbtContent(itemTag.Count);
    let tag = itemTag.tag;
    let slot = itemTag.Slot;
    let components = null;
    let result = { slot: 0, item: {} };
    let result1 = { id: id, count: count };
    if (tag != undefined) {
        components = transformItemTags(tag);
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
        result.push(transformItemItemsTag(blockItemArrays[i]));

    }
    return result;
}
function transformBlockItemTag(blockItemArrays) {
    let result = [];
    for (let i in blockItemArrays) {
        result.push(transformEntityItemTag(blockItemArrays[i]));
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
    let Value = property['Signature'];
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
    if (tag['Inventory'] != undefined) {
        tag['Inventory'] = transformBlockItemTag(tag['Inventory'])
    }
    if (tag['SelectedItem'] != undefined) {
        tag['SelectedItem'] = transformEntityItemTag(tag['SelectedItem'])
    }
    return tag;
}
function transformItemTags(tag, itemId = undefined) {
    let components = {};
    for (let key in tag) {
        switch (key) {
            case 'HideFlags':
                let hiddenflags = tag[key];
                if (hiddenflags & (1 << 0)) {
                    if (components['enchantments'] == undefined) {
                        components['enchantments'] = { levels: {} };
                    }
                    components['enchantments']['show_in_tooltip'] = false;

                }
                if (hiddenflags & (1 << 1)) {
                    if (components['attribute_modifiers'] == undefined) {
                        components['attribute_modifiers'] = { modifiers: [] };
                    }
                    components['attribute_modifiers']['show_in_tooltip'] = false;
                }
                if (hiddenflags & (1 << 2)) {
                    if (getNbtContent(tag['Unbreakable']) != undefined) {
                        if (components['unbreakable'] == undefined) {
                            components['unbreakable'] = {};
                        }
                        components['unbreakable']['show_in_tooltip'] = false;
                    }

                }
                if (hiddenflags & (1 << 3)) {
                    if ((tag['CanDestroy']) != undefined) {
                        if (components['can_break'] == undefined) {
                            components['can_break'] = {};
                        }
                        components['can_break']['show_in_tooltip'] = false;
                    }

                }
                if (hiddenflags & (1 << 4)) {
                    if ((tag['CanPlaceOn']) != undefined) {
                        if (components['can_place_on'] == undefined) {
                            components['can_place_on'] = {};
                        }
                        components['can_place_on']['show_in_tooltip'] = false;
                    }

                }
                if (hiddenflags & (1 << 5)) {
                    if (components['stored_enchantments'] == undefined) {
                        components['stored_enchantments'] = { levels: {} };
                    }
                    components['stored_enchantments']['show_in_tooltip'] = false;
                }
                if (hiddenflags & (1 << 6)) {
                    if ((tag['display']) != undefined) {
                        if ((tag['display']['color']) != undefined) {
                            if (components['dyed_color'] == undefined) {
                                components['dyed_color'] = {};
                            }
                            components['dyed_color']['show_in_tooltip'] = false;
                        }

                    }
                }
                if (hiddenflags & (1 << 7)) {
                    if (components['trim'] == undefined) {
                        components['trim'] = {};
                    }
                    components['trim']['show_in_tooltip'] = false;
                }
                break;

            case 'StoredEnchantments':
                components['stored_enchantments'] = { levels: {} };
                for (let i in tag[key]) {
                    let id = getNbtContent(tag[key][i]['id']);
                    id = transformId(ENCHANTMENTS_TRANSFORMATION, id);
                    let level = tag[key][i]['lvl'];
                    components['stored_enchantments']['levels'][id] = level;
                }
                break;
            case 'Enchantments':
                components['enchantments'] = { levels: {} };
                for (let i in tag[key]) {
                    let id = getNbtContent(tag[key][i]['id']);
                    id = transformId(ENCHANTMENTS_TRANSFORMATION, id);
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
            case 'CanDestory':
                components['can_break'] = { blocks: [] };
                for (var i in tag[key]) {
                    components['can_break']['blocks'].push(tag[key][i]);
                }
                break;
            case 'CanPlaceOn':
                components['can_place_on'] = { blocks: [] };
                for (var i in tag[key]) {
                    components['can_place_on']['blocks'].push(tag[key][i]);
                }
                break;
            case 'AttributeModifiers':
                let arrs = (tag[key]);
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
                        modifier['uuid'] = uuid;
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
                components['attribute_modifiers'] = { modifiers: modifiers };

                break;

            case 'Charged':
                if (components['charged_projectiles'] == undefined) components['charged_projectiles'] = [];
                break;
            case 'ChargedProjectiles':
                components['charged_projectiles'] = (tag[key]);
                break;
            case 'Items':
                if (deleteNameSpace(itemId) == 'bundle')
                    components['bundle_contents'] = transformBlockItemTag(tag[key]);
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
                    if (components['writable_book_contents'] == undefined) components['writable_book_contents'] = {}
                    let pages = tag[key];
                    components['writable_book_contents']['pages'] = [];
                    for (let i in pages) {
                        components['writable_book_contents']['pages'][i] = { text: pages[i] };
                    }
                } else {
                    if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                    components['written_book_contents'] = {};
                    let pages = tag[key];
                    components['written_book_contents']['pages'] = [];
                    for (let i in pages) {
                        components['written_book_contents']['pages'][i] = { text: pages[i] };
                    }
                }

                break;
            case 'filtered_pages':
                if (deleteNameSpace(itemId) == 'writable_book') {
                    if (components['writable_book_contents'] == undefined) components['writable_book_contents'] = {}
                    if (components['writable_book_contents']['pages'] == undefined) components['writable_book_contents']['pages'] = [];
                    for (let i in pages) {
                        if (components['writable_book_contents']['pages'][i] == undefined)
                            components['writable_book_contents']['pages'][i] = { filtered: pages[i] };
                        else components['writable_book_contents']['pages'][i].filtered = pages[i];
                    }
                } else {
                    if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                    if (components['written_book_contents']['pages'] == undefined) components['written_book_contents']['pages'] = [];
                    for (let i in pages) {
                        if (components['written_book_contents']['pages'][i] == undefined)
                            components['written_book_contents']['pages'][i] = { filtered: pages[i] };
                        else components['written_book_contents']['pages'][i].filtered = pages[i];
                    }
                }
                break;
            case 'author':
                if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                components['written_book_contents']['author'] = tag[key];
                break;
            case 'generation':
                if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                components['written_book_contents']['generation'] = tag[key];
                break;
            case 'resolved':
                if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                components['written_book_contents']['resolved'] = tag[key];
                break;
            case 'title':
                if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                components['written_book_contents']['title'] = tag[key];
                break;
            case 'filtered_title':
                if (components['written_book_contents'] == undefined) components['written_book_contents'] = {}
                components['written_book_contents']['title'] = { text: components['written_book_contents']['title'], filtered: tag[key] };
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
                    components['banner_patterns'] = banner_patterns;
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
    return components;
}