const transformation_1_20 = require("./transformations/transformation_1_20.js");
const transformation_1_21_4 = require("./transformations/transformation_1_21_4.js");
const package = require("./package.json")
const chestNbtTool = require("./tools/chestdatatoitemcmd/utils.js");
const { writeDebugLine, writeLine } = require("./inputSystem.js");

var transform_version = "1.20";
document.getElementById("process_1").onclick = function () {
    processText(1);
}
document.getElementById("process_2").onclick = function () {
    processText(0);
}
document.getElementById("process_3").onclick = function () {
    processText(2);
}
function processText(type) {
    if (type==0) {
        document.getElementById("output").innerText = "# Type: 1.21.4->1.21.5";
        transform_version = "1.21.4";
    } else if(type == 1) {
        document.getElementById("output").innerText = "# Type: 1.20.4->1.21";
        transform_version = "1.20";
    }else if(type == 2){
        document.getElementById("output").innerText = "# Type: Chest NBT->/item replace";
        transform_version = "chest_nbt";
    }
    writeLine("##")
    writeLine("## Datapack Upgrader v" + package.version + " by " + package.author)
    writeLine("## If you encounter a problem, make an issue on " + package.homepage)
    writeLine("## ")
    const input = document.getElementById('input').value;
    const lines = input.split(/\r?\n/);
    const outputDiv = document.getElementById('output');
    for (let i = 0; i < lines.length; i++) {
        writeLine(transformCommand(transform_version, lines[i]));
    }
}

function transformCommand(transform_version, cmd) {
    if (transform_version == "1.20") {
        return transformation_1_20.transformCommand(cmd);
    } else if (transform_version == "1.21.4") {
        return transformation_1_21_4.transformCommand(cmd);
    }else if(transform_version == "chest_nbt"){
        return chestNbtTool.chestDataToItemCmd(cmd);
    }
    return cmd;
}
document.getElementById("package-info").innerHTML = "v" + package.version + " by " + package.author + "<br/>Download CLI version and report bugs on <a target='_blank' href='" + package.homepage+"'>GitHub</a>";

