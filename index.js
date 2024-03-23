const { defaultOrValue, parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues, toItemText, deleteNameSpace } = require("./mccommand.js");
const { transformId, ENCHANTMENTS_TRANSFORMATION, ARRTIBUTEOPERATION_TRANSFORMATION, ITEMSLOT_TRANSFORMATION, FIREWORK_TRANSFORMATION, FLAGSCOLOR_TRANSFORMATION } = require("./transformations.js");
const { ERROR_MESSAGES } = require("./ErrorMessages.js");
const fs = require("fs");
const package = require("./package.json")

console.warn("###")
console.warn("### Datapack Upgrader v" + package.version + " by " + package.author)
console.warn("### If you encounter a problem, make a issue on " + package.homepage)
console.warn("### ")
const { NBTools, getNbtContent, getNbtType } = require("./NBTool.js");
var OutputFile = null;
var debugMode = false;
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i])
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
                components['lodestone_tracker']['target']['pos'] = tag[key];
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
                if (typeof t === 'object') {
                    let name = t['Name'];
                    let properties = t['Properties'];
                    if (properties != undefined) writeLine("## WARNING: We found that you used 'Properties' tag for your player_head. We didn't and won't support it. If you just need the feature, please release an issue on GitHub! And the tag also has a problem: ")
                    let id = t['Id'];
                } else {
                    components['profile'] = t;
                }
            case 'BlockEntityTag':
                let note_block_sound = tag[key]['note_block_sound'];
                let base_color = transformId(FLAGSCOLOR_TRANSFORMATION, tag[key]['Base']);
                let banner_patterns = tag[key]['Patterns'];
                let pot_decorations = tag[key]['sherds'];
                let container = tag[key]['Items'];
                let bees = tag[key]['Bees'];
                let lock = tag[key]['Lock'];
                let LootTable = tag[key]['LootTable']; //container_loot = {loot_table:,seed:}
                let LootTableSeed = tag[key]['LootTableSeed'];
                if (note_block_sound != undefined) {
                    components['note_block_sound'] = note_block_sound;
                }
                if (base_color != undefined) {
                    components['base_color'] = base_color;
                }
                if (banner_patterns != undefined) {
                    components['banner_patterns'] = banner_patterns;
                }
                if (pot_decorations != undefined) {
                    components['pot_decorations'] = pot_decorations;
                }
                if (container != undefined) {
                    components['container'] = container;
                }
                if (bees != undefined) {
                    components['bees'] = bees;
                }
                if (lock != undefined) {
                    components['lock'] = lock;
                }
                if (LootTable != undefined) {
                    components['container_loot'] = {loot_table:LootTable};
                    //container_loot = 
                    if (LootTableSeed != undefined) {
                        components['container_loot']['seed'] = LootTableSeed;
                    }
                }
                writeLine("## WARNING: We found that you used 'BlockEntityTag' tag for your item. You need to add a 'id' tag (for example: 'id: \"minecraft:oak\"') due to new changes.")
                components['block_entity_data'] = tag[key];
            case 'BlockStateTag':
                components['block_state'] = (tag[key]);
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