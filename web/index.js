const transformation_1_20 = require("./transformations/transformation_1_20.js");
const transformation_1_21_4 = require("./transformations/transformation_1_21_4.js");
const package = require("./package.json")
const { writeDebugLine, writeLine } = require("./inputSystem.js");

var transform_version = "1.20";
document.getElementById("process_1").onclick = function () {
    processText(false);
}
document.getElementById("process_2").onclick = function () {
    processText(true);
}
function processText(is_1_21_4) {
    if (is_1_21_4) {
        document.getElementById("output").innerText = "# Version: 1.21.4->1.21.5";
        transform_version = "1.21.4";
    } else {
        document.getElementById("output").innerText = "# Version: 1.20.4->1.20.6";
        transform_version = "1.20";
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
    }
    return cmd;
}
module.exports = { transformCommand }
