#!/usr/bin/env node

const transformation_1_20 = require("./transformations/transformation_1_20.js");
const transformation_1_21_4 = require("./transformations/transformation_1_21_4.js");
const { Settings, writeDebugLine, writeLine } = require("./inputSystem.js");
const readlineSync = require('readline-sync');
const SUPPORTED_VERSION = ["1.20", "1.21.4"]
var transform_version = "1.20";
function transformCommand(cmd) {
    if (transform_version == "1.20") {
        return transformation_1_20.transformCommand(cmd);
    } else if (transform_version == "1.21.4") {
        return transformation_1_21_4.transformCommand(cmd);
    }
    return cmd;
}
function transformJSON(cmd) {
    if (transform_version == "1.20") {
        return transformation_1_20.transformJSON(cmd);
    } else if (transform_version == "1.21.4") {
        return transformation_1_21_4.transformJSON(cmd);
    }
    return cmd;
}
const fs = require("fs");
const package = require("./package.json")
const pathLib = require('path')
const readline = require('readline');
console.warn("\x1B[0m###")
console.warn("\x1B[0m### \x1B[32m\x1B[1mDatapack Upgrader \x1B[31mv" + package.version + "\x1B[0m\x1B[32m by " + package.author)
console.warn("\x1B[0m### \x1B[1mIf you encounter a problem, make an issue on \x1B[34m" + package.homepage)
console.warn("\x1B[0m### Use '-h' to get more information about arguments.")
console.warn("\x1B[0m### \x1B[0m")

process.on('SIGINT', () => {
    console.log('\x1B[0m')
})


function listFile(dir) {
    let arr = fs.readdirSync(dir);
    let list = [];
    arr.forEach(function (item) {
        var fullpath = pathLib.join(dir, item);
        var stats = fs.statSync(fullpath);
        if (stats.isDirectory()) {
            list = list.concat(listFile(fullpath));
        } else {
            list.push(fullpath);
        }
    });
    return list;
}

function transformFile(input, output, overwrite = false) {
    if (pathLib.extname(input) == '.json') {
        try {
            if (fs.existsSync(output) == true && !overwrite) {
                warningMessages += "\n" + ("## WARNING: File " + output + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
                return;
            };
            if (!fs.existsSync(pathLib.dirname(output))) fs.mkdirSync(pathLib.dirname(output), { recursive: true });
            content = fs.readFileSync(input, { encoding: "utf8" });
            Settings.OutputFile = fs.createWriteStream(output);
            Settings.OutputFilePath = output;
            writeLine(transformJSON(content));
            return;
        } catch (e) {
            writeDebugLine(e);
            console.error(`## ERROR: Reading file failed: ${e.message}`);
        }
    } else if (pathLib.extname(input) == '.mcfunction') {
        try {
            if (fs.existsSync(output) == true && !overwrite) {
                Settings.warningMessages += "\n" + ("## WARNING: File " + output + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
                return;
            };
            if (!fs.existsSync(pathLib.dirname(output))) fs.mkdirSync(pathLib.dirname(output), { recursive: true });
            content = fs.readFileSync(input, { encoding: "utf8" });
            Settings.OutputFile = fs.createWriteStream(output);
            Settings.OutputFilePath = output;
            writeLine("##")
            writeLine("## Datapack Upgrader v" + package.version + " by " + package.author)
            writeLine("## If you encounter a problem, make an issue on " + package.homepage)
            writeLine("## ")
            let arrs = content.replaceAll("\r", "").split("\n");
            for (let j = 0; j < arrs.length; j++)
                writeLine(transformCommand(arrs[j].trim()));
            return;
        } catch (e) {
            writeDebugLine(e);
            console.error(`## ERROR: Reading file failed: ${e.message}`);
        }
    } else {
        return;
    }


}
function transformFolder(dir, output, overwrite = false) {
    Settings.warningMessages = "";
    dir = dir.replaceAll("\\", "/");
    output = output.replaceAll("\\", "/");
    writeDebugLine(`## Reading the folder ${dir}...`);
    Settings.OutputFile = null;
    Settings.OutputFilePath = "";
    var files = listFile(dir);
    writeLine(`\nTotal files: ${files.length}`);
    console.log("\n")
    if (!output.endsWith("/")) output = output + "/";
    for (let i = 0; i < files.length; i++) {

        // readline.clearLine(process.stdout, 0); //移动光标到行首

        let percent = (i / files.length).toFixed(4);
        var cell_num = Math.floor(percent * 25); // 计算需要多少个 █ 符号来拼凑图案

        // 拼接黑色条
        var cell = '';
        for (var j = 0; j < cell_num; j++) {
            cell += '█';
        }
        // 拼接灰色条
        var empty = '';
        for (var j = 0; j < 25 - cell_num; j++) {
            empty += '░';
        }
        // 获取相对路径
        let relativeFilePath = files[i].replaceAll("\\", "/");;
        if (relativeFilePath.startsWith(dir)) relativeFilePath = relativeFilePath.substring(dir.length);
        if (relativeFilePath.startsWith("/")) relativeFilePath = relativeFilePath.substring(1);
        transformFile(files[i], output + relativeFilePath, overwrite);

        // 拼接最终文本
        let cmdText = 'Transforming: ' + (100 * percent).toFixed(2) + '% ' + cell + empty + ' ' + i + '/' + files.length + `  Transforming: ${relativeFilePath}\n`;

        process.stdout.write(cmdText, 'utf-8');

    }

    process.stdout.write("Transforming: 100.00% █████████████████████████ " + files.length + "/" + files.length + "  Transforming Completed!\n", 'utf-8');
    console.log("\n" + Settings.warningMessages + `\nTotal: ${Settings.warningMessages.split("\n").length - 1} Warnings/Errors`);
}
const HELP_CONTENT = `
Command Arguments:
[Commands 1] [Commands2] ...

Supported commands:
-v <1.20/1.21.4>                    Change transformation pattern.
                                    1.20 for 1.20 to 1.21; 1.21.4 for 1.21.4 to 1.21.5
-h                                  Show help texts(This).
-i <input(File)> <Output File>      Transform a File.
    [-y]                            Overwrite the existed file.
-i <input(Folder)> <Output Folder>  Transform a Folder.
    [-y]                            Overwrite the existed file.
-debug                              Show debug messages
-c <commands>                       Transform a command. Use '\\n' to transform multiline commands.`;
let argvs = process.argv;
let i = 0;
function ci_dialog() {
    console.log("\n\x1B[32mWhat do you want to do?\x1B[0m\n\x1B[33m[1] \x1B[0mTranslate commands from input.\n\x1B[33m[2] \x1B[0mTranslate commands from files/folders\n\x1B[33m[3] \x1B[0mGet help of command line arguments.\n\x1B[33m[4] \x1B[0mChange transformation version.\n\x1B[32mEnter the number between '[]' to continue.")
    let cont = readlineSync.question("\x1B[34mINPUT> \x1B[33m")
    if (cont == '1') {
        console.log("\x1B[32mPlease enter the command below: ")
        let cmd = readlineSync.question("\x1B[34mINPUT> \x1B[33m")
        argvs.push("-c")
        argvs.push(cmd)
    } else if (cont == '3') {
        argvs.push("-h")
    } else if (cont == '4') {
        console.log("\x1B[32mPlease enter the version you want to transform.\nSupported versions: \x1B[33m" + JSON.stringify(SUPPORTED_VERSION))
        argvs.push("-v")
        let version = readlineSync.question("\x1B[35mVERSION> \x1B[33m")
        argvs.push(version)
        ci_dialog();
    } else if (cont == '2') {
        console.log("\x1B[32mPlease enter the file or folder path below: ")
        let inputFile = readlineSync.questionPath("\x1B[35mINPUT FILE/FOLDER> \x1B[33m")
        let outputFile = readlineSync.questionPath("\x1B[36mOUTPUT FILE/FOLDER> \x1B[33m", { exists: null })
        let overwrite = readlineSync.keyInYN("\x1B[34mIf the folder exist, do you want to overwrite it?\x1B[33m")
        argvs.push("-i")
        argvs.push(inputFile)
        argvs.push(outputFile)
        if (overwrite) argvs.push("-y")

    }
    console.log('\x1B[0m')
}
if (argvs.indexOf("-i") == -1 && argvs.indexOf("-h") == -1 && argvs.indexOf("-c") == -1) {
    ci_dialog();
}
while (i < argvs.length) {
    let arg = argvs[i];
    if (arg == '-v') {
        i++;
        if (i < argvs.length) {
            let version = (argvs[i].trim());
            if (SUPPORTED_VERSION.indexOf(version) == -1) {
                console.error("Not supported transformation version: " + version);
                // break;
            }else{
                console.log("Change transformation version to: " + version);
                transform_version = version;
            }
        }
    }
    if (arg == '-h') {
        console.log(HELP_CONTENT);
        return;
    }
    if (arg == '-debug') {
        Settings.debugMode = !Settings.debugMode;
    }
    if (arg == '-json') {
        Settings.jsonMode = !Settings.jsonMode;
    }
    if (arg == '-c') {
        i++;
        if (i < argvs.length) {
            let arrs = argvs[i].split("\\n");
            for (let j = 0; j < arrs.length; j++)
                writeLine(transformCommand(arrs[j]));
        }
    } else if (arg == '-i') {
        i++;
        if (i < argvs.length) {
            let path = argvs[i];
            let content = "";

            try {
                let stats = fs.statSync(path);
                if (stats.isDirectory()) {
                    i++;
                    if (i < argvs.length) {
                        let output = argvs[i];
                        i++;
                        let overWriteFiles = false;
                        if (i < argvs.length) {
                            if (argvs[i] == '-y') {
                                overWriteFiles = true;
                            } else i--;
                        }
                        transformFolder(path, output, overWriteFiles);
                        continue;
                    } else {
                        console.error("## Missing output file.")
                        return;
                    }
                } else {
                    i++;
                    warningMessages = "";
                    if (i < argvs.length) {
                        let output = argvs[i];
                        i++;
                        let overWriteFiles = false;
                        if (i < argvs.length) {
                            if (argvs[i] == '-y') {
                                overWriteFiles = true;
                            } else i--;
                        }
                        transformFile(path, output, overWriteFiles);
                        console.log("\n" + warningMessages + `\nTotal: ${warningMessages.split("\n").length - 1} Warnings/Errors`);

                    } else {
                        console.error("## Missing output file.")
                        return;
                    }
                }
            } catch (error) {
                console.error("## Error while reading file: " + error.message)
                writeDebugLine(error);
                continue;
            }
        }
    }
    i++;
}
if (Settings.OutputFile != null) {
    Settings.OutputFile.end();
}

