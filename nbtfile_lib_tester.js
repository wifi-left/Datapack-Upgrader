const { NBTFILE_PARSER, NBTFILE_SAVER, MCNBT, NBTFILE_SNBT_TOOL, MCAFILE_PARSER, MCAFILE_SAVER } = require("./nbtfile_lib.js");
const fs = require("fs");
const { NBTools } = require("./NBTool.js");

/*
//测试SNBT转MCNBT
let snbt = NBTools.ParseNBT(`{respawn:{pos:[I;188,124,26],forced:1b,pitch:0f,dimension:"minecraft:overworld",yaw:0f},Brain:{memories:{}},HurtByTimestamp:0,SleepTimer:0,Invulnerable:0b,FallFlying:0b,PortalCooldown:0,AbsorptionAmount:0f,abilities:{instabuild:0b,walkSpeed:0.10000000149011612f,invulnerable:0b,mayfly:0b,mayBuild:0b,flying:0b,flySpeed:0.05000000074505806f},active_effects:[{duration:37,show_icon:0b,amplifier:25b,id:"minecraft:resistance",show_particles:0b}],recipeBook:{recipes:[],toBeDisplayed:[]},DeathTime:0,XpSeed:-1362058031,XpTotal:0,UUID:[I;-1923199651,-1349041700,-1620443036,1295463420],playerGameType:2,Tags:["map.old","build_guess.nokiller","build_guess.guesser"],seenCredits:0b,Motion:[0d,-0.0784000015258789d,0d],Health:20f,foodSaturationLevel:20f,ignore_fall_damage_from_current_explosion:0b,equipment:{},fall_distance:0d,Air:300,OnGround:1b,Dimension:"minecraft:parkourworld",Rotation:[0f,90f],XpLevel:0,current_impulse_context_reset_grace_time:0,warden_spawn_tracker:{warning_level:0,ticks_since_last_warning:5447,cooldown_ticks:0},Score:0,Pos:[-128.5d,-43d,318.5d],previousPlayerGameType:3,Fire:-20,XpP:0f,EnderItems:[],attributes:[{id:"minecraft:gravity",base:0.08d},{id:"minecraft:step_height",base:0.6000000238418579d},{id:"minecraft:attack_damage",base:1d},{id:"minecraft:block_interaction_range",base:4.5d},{id:"minecraft:armor_toughness",base:0d},{id:"minecraft:movement_efficiency",base:0d},{id:"minecraft:entity_interaction_range",base:3d},{id:"minecraft:max_health",base:20d},{id:"minecraft:safe_fall_distance",base:3d},{id:"minecraft:armor",base:0d},{id:"minecraft:attack_speed",base:4d},{id:"minecraft:waypoint_transmit_range",base:60000000d},{id:"minecraft:movement_speed",base:0.10000000149011612d}],DataVersion:4556,foodLevel:20,foodExhaustionLevel:0f,spawn_extra_particles_on_fall:0b,HurtTime:0,SelectedItemSlot:0,Inventory:[{components:{"minecraft:item_name":"请使用书与笔进行猜测(丢弃物品可重新获得)","minecraft:custom_data":{build_guess:2}},count:1,Slot:0b,id:"minecraft:writable_book"},{components:{"minecraft:item_name":"金币","minecraft:max_stack_size":99,"minecraft:rarity":"epic","minecraft:custom_data":{build_guess:3}},count:2,Slot:1b,id:"minecraft:sunflower"}],LastDeathLocation:{pos:[I;34,-291,24],dimension:"minecraft:killerworld"},foodTickTimer:0}`)

let res = NBTFILE_SNBT_TOOL.ToMCNBT(snbt);
let saver = new NBTFILE_SAVER();
saver.fromMCNBT(res);
fs.writeFileSync("./debug/nbtfile/nbt_structure.json", JSON.stringify(res, null, 2));
fs.writeFileSync("./debug/nbtfile/nbt_test.dat", saver.get_gzip_raw());
*/

/*
// 测试 .mca 文件
let m = new MCAFILE_PARSER();
m.load_file("./sample/nbtfile/r.0.0.mca");
m.parse_header();
console.log("Total regions: " + m.headers.length)
fs.mkdirSync("./debug/nbtfile/mca_tests", { recursive: true });
m.parse_all_region_data();
let snbt = NBTFILE_SNBT_TOOL.ToSNBT(new NBTFILE_PARSER(m.headers[0].data).parse());
snbt['hello'] = 'world';
let p = new NBTFILE_SAVER();
p.fromMCNBT(NBTFILE_SNBT_TOOL.ToMCNBT(snbt));
m.headers[0].data = p.get_raw();
// res = new NBTFILE_PARSER(m.headers[0].data).parse();
// console.log(m.headers[0].x,m.headers[0].z)
// fs.writeFileSync("./debug/nbtfile/nbt_structure.json", JSON.stringify(res, null, 2));

let mca_saver = new MCAFILE_SAVER(m.headers);
mca_saver.save_to_file("./debug/nbtfile/r.0.0.mca", 2);
*/

// 测试 NBT .dat文件
let tester = new NBTFILE_PARSER();
tester.try_load_file_with_gzip("./sample/nbtfile/level.dat");
// return false;
let res = tester.parse();
let snbt = NBTFILE_SNBT_TOOL.ToSNBT(res);
let snbt_text = NBTools.ToString(snbt);
let saver = new NBTFILE_SAVER();
// console.log(snbt);
fs.mkdirSync("./debug/nbtfile", { recursive: true });
// console.log(res);
fs.writeFileSync("./debug/nbtfile/nbt_structure.json", JSON.stringify(res, null, 2));
fs.writeFileSync("./debug/nbtfile/snbt.snbt", snbt_text);
saver.fromMCNBT(NBTFILE_SNBT_TOOL.ToMCNBT(snbt));
