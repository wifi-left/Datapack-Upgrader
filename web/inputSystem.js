
var Settings = {
    OutputFile: null,
    OutputFilePath: "",
    debugMode: false,
    jsonMode: false,
    warningMessages: ""
};
const outputObj = document.getElementById("output")
const debugObj = document.getElementById("debug")
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        outputObj.innerText += "\n" + lines[i];
    }
}
function writeDebugLine(...lines) {
    if (!Settings.debugMode) return;
    for (let i = 0; i < lines.length; i++) {
        console.debug(lines[i])
        debugObj.innerText += "\n" + lines[i];

    }
}

module.exports = { writeDebugLine, writeLine, Settings }
