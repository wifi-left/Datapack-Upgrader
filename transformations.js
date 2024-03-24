const ENCHANTMENTS_TRANSFORMATION = { "sweeping": "sweeping_edge", "minecraft:sweeping": "minecraft:sweeping_edge" }
const ARRTIBUTEOPERATION_TRANSFORMATION = { "0": "add_value", "1": "add_multiplied_base", "2": "add_multiplied_total" }
const FIREWORK_TRANSFORMATION = { "0": "small_ball", "1": "large_ball", "2": "star", "3": "creeper", "4": "burst" }
const FLAGSCOLOR_TRANSFORMATION = { "0": "white", "1": "orange", "2": "magenta", "3": "light_blue", "4": "yellow", "5": "lime", "6": "pink", "7": "gray", "8": "light_gray", "9": "cyan", "10": "purple", "11": "blue", "12": "brown", "13": "green", "14": "red", "15": "black" }
const ITEMSLOT_TRANSFORMATION = { "horse.armor": "armor.body" }
const MAP_TRANSFORMATION = {
    "0": "player", "1": "frame", "2": "red_marker", "3": "blue_marker", "4": "target_x", "5": "target_point", "6": "player_off_map", "7": "player_off_limits", "8": "mansion", "9": "monument", "10": "banner_white", "11": "banner_orange", "12": "banner_magenta", "13": "banner_light_blue", "14": "banner_yellow", "15": "banner_lime", "16": "banner_pink", "17": "banner_gray", "18": "banner_light_gray", "19": "banner_cyan", "20": "banner_purple", "21": "banner_blue", "22": "banner_brown", "23": "banner_green", "24": "banner_red", "25": "banner_black", "26": "red_x", "27": "village_desert", "28": "village_plains", "29": "village_savanna", "30": "village_snowy", "31": "village_taiga", "32": "jungle_temple", "33": "swamp_hut"
}
const DATAPATH_TRANSFORMATION = [
    {
        "regexp":"",
        "replace":""
    }
]
function transformId(array, id) {
    let res = array[id];
    if (res == undefined || res == "") return id;
    return res;
}
module.exports = { transformId, ENCHANTMENTS_TRANSFORMATION, ARRTIBUTEOPERATION_TRANSFORMATION, ITEMSLOT_TRANSFORMATION, MAP_TRANSFORMATION, FIREWORK_TRANSFORMATION, FLAGSCOLOR_TRANSFORMATION, DATAPATH_TRANSFORMATION }
