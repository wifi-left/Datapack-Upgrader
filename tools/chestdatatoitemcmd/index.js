const readlineSync = require('readline-sync');
const chestTool = require("./utils.js");
var inputNBT = readlineSync.question("\x1B[34mDATA INPUT> \x1B[33m")
console.log("\x1B[34m## RESULT\x1B[0m")
console.log(chestTool.chestDataToItemCmd(inputNBT));
console.log("\x1B[0m")
