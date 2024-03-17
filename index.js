const { parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues, toItemText, deleteNameSpace } = require("./mccommand.js");
const { transformId, ENCHANTMENTS_TRANSFORMATION, ARRTIBUTEOPERATION_TRANSFORMATION, ITEMSLOT_TRANSFORMATION } = require("./transformations.js");
const fs = require("fs");
const package = require("./package.json")

console.warn("###")
console.warn("### Datapack Upgrader v" + package.version + " by " + package.author)
console.warn("### If you encounter a problem, make a issue on " + package.homepage)
console.warn("### ")
const { NBTools, getNbtContent, getNbtType } = require("./NBTool.js");
var OutputFile = null;
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i])
    }
}
let argvs = process.argv;
let i = 0;
while (i < argvs.length) {
    let arg = argvs[i];
    if (arg == '-c') {
        i++;
        if (i < argvs.length) {
            let arrs = argvs[i].split("\\n");
            for (let j = 0; j < arrs.length; j++)
                writeLine(transformCommand(arrs[j]));
        }
    }
    if (arg == '-I') {
        i++;
        if (i < argvs.length) {
            let path = argvs[i];
            let content = "";
            try {
                console.info("# 读取文件 '" + path + "'")
                content = fs.readFileSync(path, { encoding: "utf8" });
            } catch (error) {
                console.error("# 读取文件时发生错误：" + error.message)
                continue
            }
            let arrs = content.replace("\r", "").split("\n");
            for (let j = 0; j < arrs.length; j++)
                writeLine(transformCommand(arrs[j].trim()));
        }
    }
    i++;
}

function transformCommand(command) {
    if (command == "") return "";
    let comArgs = [];
    try {
        comArgs = parseCommand(command);
        // writeLine(comArgs);

    } catch (error) {
        writeLine("# 在解析命令时发生错误：" + error.message);
        console.error(error);
        return command;
    }
    if (comArgs.length <= 0) {
        writeLine("# 由于程序内部发生未知错误而解析错误");
        return command;
    }
    let cmdRoot = comArgs[0];
    if (cmdRoot.startsWith("/")) cmdRoot = cmdRoot.substring(1);
    try {
        switch (cmdRoot) {
            case 'give':
                if (comArgs.length <= 2) {
                    writeLine("# 解析错误：命令参数不够");
                    return command;
                } else {
                    let selector = transformSelector(comArgs[1]);
                    let item = transformItem(comArgs[2]);
                    return `${cmdRoot} ${selector} ${item}`;
                }
            case 'item':
                if (comArgs.length <= 2) {
                    writeLine("# 解析错误：命令参数不够");
                    return command;
                } else {
                    if (comArgs[1] == 'replace') {
                        if (comArgs[2] == 'block') {
                            if (comArgs.length < 8) {
                                writeLine("# 解析错误：命令参数不够");
                                return command;
                            }
                            if (comArgs[7] == 'with') {
                                if (comArgs.length < 9) {
                                    writeLine("# 解析错误：命令参数不够");
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
                                writeLine("# 解析错误：命令参数不够");
                                return command;
                            }
                            if (comArgs[5] == 'with') {
                                if (comArgs.length < 7) {
                                    writeLine("# 解析错误：命令参数不够");
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
            // case 'clear':
        }
    } catch (error) {
        writeLine("# 在转换命令时发生错误：" + error.message);
    }
    return command;
}

function transformSelector(selectorText) {
    let selector = parseSelectorArg(selectorText);
    // console.log(selector)
    // TODO: 转换 selector 中 nbt
    return selectorText;
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
function transformItem(itemText) {
    let item = parseItemArg(itemText);
    // console.log(NBTools.ToString(item.tags))
    if (item.components != null) {
        return itemText;
    }
    if (item.tags != null) {
        let transformedComponent = transformItemTags(item.tags, item.id);
        item.components = transformedComponent;
    }
    return toItemText(item);
}
function transformBlockTags(tag) {
    return tag;
}
function transformItemTags(tag, itemId = undefined) {
    let components = {};
    for (let key in tag) {
        switch (key) {
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
                    components['can_break']['blocks'][components['can_break']['blocks'].length] = tag[key][i];
                }
                break;
            case 'CanPlaceOn':
                components['can_place_on'] = { blocks: [] };
                for (var i in tag[key]) {
                    components['can_place_on']['blocks'][components['can_place_on']['blocks'].length] = tag[key][i];
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
                    modifiers[modifiers.length] = modifier;
                }
                components['attribute_modifiers'] = { modifiers: modifiers };

                break;

            case 'Charged':
                if (components['charged_projectiles'] == undefined) components['charged_projectiles'] = [];
                break;
            case 'ChargedProjectiles':
                components['charged_projectiles'] = (tag[key]);
                break;
            case 'Item':
                if (deleteNameSpace(itemId) == 'bundle')
                    components['bundle_contents'] = (tag[key]);
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
            case 'CustomModelData':
                components['custom_model_data'] = (tag[key]);
                break;
            /*  case 'RepairCost':
                components['repair_cost'] = (tag[key]);
                break;

                TO-DO:
                HideFlags
                potion_contents
                writable_book_contents
                written_book_contents
                trim
                suspicious_stew
                hide_additional_tooltip
                debug_stick_state
                entity_data
                bucket_entity_data
                instrument
                recipes
                lodestone_tracker
                firework_explosion
                fireworks
                profile
                note_block_sound
                base_color
                banner_patterns
                pot_decorations
                container //BlockEntityTag.Items
                bees
                lock
                container_loot
                block_entity_data
                block_state
                enchantment_glint_override
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