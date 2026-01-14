const { NBTFILE_PARSER, NBTFILE_SAVER, MCNBT, NBTFILE_SNBT_TOOL } = require("./nbtfile_lib.js");
const fs = require("fs");
const { NBTools } = require("./NBTool.js");
let tester = new NBTFILE_PARSER();
let saver = new NBTFILE_SAVER();
tester.try_load_file_with_gzip("./sample/nbtfile/player.dat");
// return false;
let res = tester.parse();
let snbt = NBTFILE_SNBT_TOOL.FromMCNBT(res);
let snbt_text = NBTools.ToString(snbt);
saver.fromMCNBT(res);

fs.mkdirSync("./debug/nbtfile", { recursive: true });
// console.log(res);
fs.writeFileSync("./debug/nbtfile/nbt_structure.json", JSON.stringify(res, null, 2));
fs.writeFileSync("./debug/nbtfile/snbt.snbt", snbt_text);
saver.save_with_gzip("./debug/nbtfile/test.dat");
