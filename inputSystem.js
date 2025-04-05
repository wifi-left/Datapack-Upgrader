
var Settings = {
    OutputFile: null,
    OutputFilePath: "",
    debugMode: false,
    jsonMode: false,
    warningMessages: ""
};
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        if (Settings.OutputFile != null) {
            // ## ERROR: 
            if(lines[i] == null) continue;
            if (lines[i].startsWith("## SyntaxError: ")) {
                Settings.warningMessages += "\n" + ("\x1B[31m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");
            } else if (lines[i].startsWith("## ERROR: ")) {
                Settings.warningMessages += "\n" + ("\x1B[31m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");
            } else if (lines[i].startsWith("## WARNING")) {
                Settings.warningMessages += "\n" + ("\x1B[33m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");
            }
            Settings.OutputFile.write(lines[i] + "\r\n");
        } else {
            if (lines[i].startsWith("## ERROR:")) console.log("\x1B[31m")
            else if (lines[i].startsWith("## Error")) console.log("\x1B[31m")
            else if (lines[i].startsWith("## WARNING")) {
                console.log("\x1B[33m");
            }
            console.log(lines[i] + "\x1B[0m");
        }
    }
}
function writeDebugLine(...lines) {
    if (!Settings.debugMode) return;
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i])
    }
}

module.exports = { writeDebugLine, writeLine, Settings }
