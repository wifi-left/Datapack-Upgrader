
var Settings = {
    OutputFile: null,
    OutputFilePath: "",
    debugMode: false,
    jsonMode: false,
    warningMessages: "",
    nowLine: 0,
    nowFile: null,
    noWarnings: false,
    beforeLog_once: null,
    result: null,
    warningMessagesRaw: "",
    relativeFilePath: null,
    noRepeat:false
};
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        if (Settings.OutputFile != null) {
            // ## ERROR: 
            if (lines[i] == null) continue;
            if (lines[i].startsWith("## SyntaxError: ")) {
                if (Settings.noWarnings) return;
                Settings.warningMessagesRaw += (lines[i] + " in file " + Settings.OutputFilePath + "")
                    + "\r\n";
                Settings.warningMessages += "\n" + ("\x1B[31m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");

            } else if (lines[i].startsWith("## ERROR: ")) {
                if (Settings.noWarnings) return;
                Settings.warningMessagesRaw += (lines[i] + " in file " + Settings.OutputFilePath + "")
                    + "\r\n";
                Settings.warningMessages += "\n" + ("\x1B[31m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");

            } else if (lines[i].startsWith("## WARNING")) {
                if (Settings.noWarnings) return;
                Settings.warningMessagesRaw += (lines[i] + " in file " + Settings.OutputFilePath + "") + "\r\n";
                Settings.warningMessages += "\n" + ("\x1B[33m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");
            } else if (lines[i].startsWith("## Error")) {
                if (Settings.noWarnings) return;
                Settings.warningMessagesRaw += (lines[i] + " in file " + Settings.OutputFilePath + "") + "\r\n";
                Settings.warningMessages += "\n" + ("\x1B[31m" + lines[i] + " \x1B[34min file \x1B[36m\x1B[4m" + Settings.OutputFilePath + "\x1B[0m");
            }
            if (!Settings.hasLog) Settings.hasLog = true;
            if (Settings.beforeLog_once != null) {
                Settings.OutputFile.write(Settings.beforeLog_once);
                Settings.beforeLog_once = null;
            }
            Settings.OutputFile.write(lines[i] + "\r\n");
        } else {
            if (!Settings.hasLog) Settings.hasLog = true;
            if (lines[i].startsWith("## ERROR:")) console.log("\x1B[31m")
            else if (lines[i].startsWith("## Error")) console.log("\x1B[31m")
            else if (lines[i].startsWith("## WARNING")) {
                console.log("\x1B[33m");
            } else if (lines[i].startsWith("## SyntaxError: ")) {
                console.log("\x1B[31m")
            }
            if (Settings.beforeLog_once != null) {
                console.log(Settings.beforeLog_once);
                Settings.beforeLog_once = null;
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
