#!/usr/bin/env node
const NBTFILE_LIB = require("./nbtfile_lib.js")
const translation_getkey = require("./transformations/translation_getkey.js");
const translation_applykey = require("./transformations/translation_applykey.js");
const translation_reskey = require("./transformations/translation_reskey.js");
const { Settings, writeDebugLine, writeLine } = require("./inputSystem.js");
const readlineSync = require('readline-sync');
var transform_version = "get";

const MOVE_LEFT = Buffer.from('1b5b3130303044', 'hex').toString();
const MOVE_UP = Buffer.from('1b5b3141', 'hex').toString();
const CLEAR_LINE = Buffer.from('1b5b304b', 'hex').toString();

function clearnLine(n) {
    for (let index = 0; index < n; index++) {
        process.stdout.write(MOVE_LEFT + CLEAR_LINE + MOVE_UP);
    }
}

function transformCommand(cmd) {
    if (transform_version == "get") {
        return translation_getkey.transformCommand(cmd);
    } else if (transform_version == "apply") {
        return translation_applykey.transformCommand(cmd);
    } else if (transform_version == "reskey") {
        return translation_reskey.transformCommand(cmd);
    }
    return cmd;
}
const fs = require("graceful-fs");
const package = require("./package.json")
const pathLib = require('path')
const readline = require('readline');
console.warn("\x1B[0m###")
console.warn("\x1B[0m### \x1B[32m\x1B[1mDatapack Translator \x1B[31mv" + package.version + "\x1B[0m\x1B[32m by " + package.author)
console.warn("\x1B[0m### \x1B[1mIf you encounter a problem, make an issue on \x1B[34m" + package.homepage)
console.warn("\x1B[0m### Use '-h' to get more information about arguments.")
console.warn("\x1B[0m### \x1B[0m")

process.on('SIGINT', () => {
    console.log('\x1B[0m')
})


function listFile(dir) {
    writeDebugLine("# DEBUG: Reading Folder " + dir);
    let arr = fs.readdirSync(dir);
    let list = [];
    let folderlist = [];
    arr.forEach(function (item) {
        var fullpath = pathLib.join(dir, item);
        var stats = fs.statSync(fullpath);
        if (stats.isDirectory()) {
            // list = list.concat(listFile(fullpath));
            folderlist.push(fullpath)
        } else {
            list.push(fullpath);
        }
    });
    for (let i = 0; i < folderlist.length; i++) {
        list = list.concat(listFile(folderlist[i]));
    }
    return list;
}
function transformGetFile(input, output, overwrite = false) {
    if (fs.existsSync(output) == true && !overwrite) {
        Settings.warningMessages += "\n" + ("## WARNING: File " + output + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
        return;
    };
    Settings.OutputFile = fs.createWriteStream(output);
    Settings.OutputFilePath = output;
    writeLine("##")
    writeLine("## Datapack Translator v" + package.version + " by " + package.author)
    writeLine("## If you encounter a problem, make an issue on " + package.homepage)
    writeLine("## ")
    transformGetFile_true(input)
}
function transformGetFile_true(input) {
    Settings.noWarnings = true;
    if (pathLib.extname(input) == '.mcfunction') {
        try {
            content = fs.readFileSync(input, { encoding: "utf8" });


            let arrs = content.replaceAll("\r", "").split("\n");
            for (let j = 0; j < arrs.length; j++) {
                let cmd = arrs[j].trim();
                while (cmd.endsWith("\\")) {
                    cmd = cmd.substring(0, cmd.length - 1)
                    j++;
                    if (j >= arrs.length) {
                        throw new Error("Wrong '\\' at the end of the file.")
                    }
                    cmd += arrs[j].trim();
                }
                Settings.nowLine = j;
                Settings.nowFile = input;
                Settings.hasLog = false
                Settings.beforeLog_once = "#!#[file=" + JSON.stringify(pathLib.basename(input)) + ",line=" + j + "]" + "\r\n";
                transformCommand(cmd.trim());

            }

            return;
        } catch (e) {
            writeDebugLine(e);
            console.error(`## ERROR: Reading file failed: ${e.message}`);
        }
    } else {
        return;
    }
}
function transformGetFolder(dir, output, overwrite = false) {
    if (fs.existsSync(output) == true && !overwrite) {
        Settings.warningMessages += "\n" + ("## WARNING: File " + output + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
        return;
    };
    Settings.OutputFile = fs.createWriteStream(output);
    Settings.OutputFilePath = output;
    writeLine("##")
    writeLine("## Datapack Translator v" + package.version + " by " + package.author)
    writeLine("## If you encounter a problem, make an issue on " + package.homepage)
    writeLine("## ")
    Settings.warningMessages = "";
    dir = dir.replaceAll("\\", "/");
    writeDebugLine(`## Reading the folder ${dir}...`);
    var files = listFile(dir);
    console.log(`\nTotal files: ${files.length}`);
    console.log("\n")
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
        transformGetFile_true(files[i]);

        // 拼接最终文本
        let cmdText = 'Transforming: ' + (100 * percent).toFixed(2) + '% ' + cell + empty + ' ' + i + '/' + files.length + `  Transforming: ${relativeFilePath}\n`;

        process.stdout.write(cmdText, 'utf-8');

    }

    process.stdout.write("Transforming: 100.00% █████████████████████████ " + files.length + "/" + files.length + "  Transforming Completed!\n", 'utf-8');
}
function transformReskeyFile(input, output, reskeyOutput, overwrite = false) {
    if (fs.existsSync(output) == true && !overwrite) {
        Settings.warningMessages += "\n" + ("## WARNING: File " + output + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
        return;
    };
    if (fs.existsSync(reskeyOutput) == true && !overwrite) {
        Settings.warningMessages += "\n" + ("## WARNING: File " + reskeyOutput + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
        return;
    };
    Settings.result = {};
    if (!fs.existsSync(pathLib.dirname(output))) fs.mkdirSync(pathLib.dirname(output), { recursive: true });

    Settings.OutputFile = fs.createWriteStream(output);
    Settings.OutputFilePath = output;
    transformReskeyFile_true(input)
    if (!fs.existsSync(pathLib.dirname(reskeyOutput))) fs.mkdirSync(pathLib.dirname(reskeyOutput), { recursive: true });
    fs.writeFileSync(reskeyOutput, JSON.stringify(Settings.result, null, 4));
}
function transformReskeyMCNBT(data) {
    let basename = pathLib.basename(Settings.OutputFilePath);
    let extname = pathLib.extname(Settings.OutputFilePath);
    if (basename == 'scoreboard.dat') {
        let dt = data['data'];
        if (dt['Teams'] != null) {
            let ddt = dt['Teams'];
            for (let i = 0; i < ddt.length; i++) {
                let ele = ddt[i];
                if (ele['MemberNamePrefix'] != null) {
                    ele['MemberNamePrefix'] = translation_reskey.transformRawMsg(ele['MemberNamePrefix']);
                }
                if (ele['MemberNameSuffix'] != null) {
                    ele['MemberNameSuffix'] = translation_reskey.transformRawMsg(ele['MemberNameSuffix']);
                }
                ddt[i] = ele;
            }
        }
        if (dt['Objectives'] != null) {
            let ddt = dt['Objectives'];
            for (let i = 0; i < ddt.length; i++) {
                let ele = ddt[i];
                if (ele['DisplayName'] != null) {
                    ele['DisplayName'] = translation_reskey.transformRawMsg(ele['DisplayName']);
                }
                ddt[i] = ele;
            }
        }
    } else if (extname == '.mca') {
        if (data['block_entities'] != null) {
            let dt = data['block_entities'];
            for (let i = 0; i < dt.length; i++) {
                dt[i] = translation_reskey.transformBlockTags(dt[i]);
            }
            data['block_entities'] = dt;
        }
        if (data['Entities'] != null) {
            let dt = data['Entities'];
            for (let i = 0; i < dt.length; i++) {
                dt[i] = translation_reskey.transformEntityTags(dt[i]);
            }
            data['Entities'] = dt;
        }
    }
    return data;
}
function transformReskeyFile_true(input) {
    // Settings.noWarnings = false;
    if (pathLib.extname(input) == '.mcfunction') {
        try {
            writeLine("##")
            writeLine("## Datapack Translator v" + package.version + " by " + package.author)
            writeLine("## If you encounter a problem, make an issue on " + package.homepage)
            writeLine("## ")
            content = fs.readFileSync(input, { encoding: "utf8" });


            let arrs = content.replaceAll("\r", "").split("\n");
            for (let j = 0; j < arrs.length; j++) {
                let cmd = arrs[j].trim();
                while (cmd.endsWith("\\")) {
                    cmd = cmd.substring(0, cmd.length - 1)
                    j++;
                    if (j >= arrs.length) {
                        throw new Error("Wrong '\\' at the end of the file.")
                    }
                    cmd += arrs[j].trim();
                }
                Settings.nowLine = j;
                Settings.nowFile = input;
                Settings.hasLog = false
                // Settings.beforeLog_once = "#!#[file=" + JSON.stringify(pathLib.basename(input)) + ",line=" + j + "]" + "\r\n";
                writeLine(transformCommand(cmd.trim()));

            }

            return;
        } catch (e) {
            writeDebugLine(e);
            console.error(`## ERROR: Reading file failed: ${e.message}`);
        }
    } else if (pathLib.extname(input) == '.json') {
        try {
            var content = fs.readFileSync(input, { encoding: "utf8" });

            Settings.nowLine = 0;
            Settings.nowFile = input;
            Settings.hasLog = false
            // Settings.beforeLog_once = "#!#[file=" + JSON.stringify(pathLib.basename(input)) + ",line=" + j + "]" + "\r\n";

            Settings.OutputFile.write(translation_reskey.transformJSON(content))

        } catch (e) {
            writeDebugLine(e);
            console.error(`## ERROR: Reading file failed: ${e.message}`);
        }
    } else {
        if (!Settings.enableBinary)
            return;

        if (['.nbt', '.dat'].includes(pathLib.extname(input))) {
            try {
                let parser = new NBTFILE_LIB.NBTFILE_PARSER();
                let saver = new NBTFILE_LIB.NBTFILE_SAVER();
                let isGziped = parser.try_load_file_with_gzip(input);
                Settings.nowLine = 0;
                Settings.nowFile = input;
                Settings.hasLog = false
                let data = parser.parse();
                let snbt = NBTFILE_LIB.NBTFILE_SNBT_TOOL.ToSNBT(data);
                snbt = transformReskeyMCNBT(snbt);
                data = NBTFILE_LIB.NBTFILE_SNBT_TOOL.ToMCNBT(snbt);

                saver.fromMCNBT(data);
                // Settings.beforeLog_once = "#!#[file=" + JSON.stringify(pathLib.basename(input)) + ",line=" + j + "]" + "\r\n";
                if (isGziped)
                    saver.save_with_gzip(Settings.OutputFilePath);
                else saver.save_nogzip(Settings.OutputFilePath);
                // Settings.OutputFile.write(translation_reskey.transformJSON(content))
            } catch (e) {
                writeDebugLine(e);
                // throw new Error(e);
                console.error(`## ERROR: Reading file failed: ${e.message}`);
            }


        } else if (pathLib.extname(input) == '.mca') {
            try {
                let parser = new NBTFILE_LIB.MCAFILE_PARSER();
                let saver = new NBTFILE_LIB.MCAFILE_SAVER();
                parser.load_file(input);
                parser.parse_header();

                Settings.nowLine = 0;
                Settings.nowFile = input;
                Settings.hasLog = false
                console.log("Loading MCA Regions...")
                let LEN = parser.headers.length;
                for (let i = 0; i < LEN; i++) {
                    if ((i + 1) % (LEN / 16) == 0) {
                        clearnLine(1);
                        console.log(`Loading MCA [${(i + 1)}/${parser.headers.length}]...`)
                    }

                    let tester = parser.parse_region_data(parser.headers[i]);
                    let snbt = NBTFILE_LIB.NBTFILE_SNBT_TOOL.ToSNBT(new NBTFILE_LIB.NBTFILE_PARSER(tester.content).parse());

                    snbt = transformReskeyMCNBT(snbt);
                    // console.log(snbt)
                    let p = new NBTFILE_LIB.NBTFILE_SAVER();
                    p.fromMCNBT(NBTFILE_LIB.NBTFILE_SNBT_TOOL.ToMCNBT(snbt));
                    parser.headers[i].data = p.get_raw();
                }
                clearnLine(1);
                saver.headers = parser.headers;
                saver.save_to_file(Settings.OutputFilePath, 2);
                // Settings.OutputFile.write(translation_reskey.transformJSON(content))
            } catch (e) {
                writeDebugLine(e);
                console.error(`## ERROR: Reading file failed: ${e.message}`);
            }
        }
    }
}
function transformReskeyFolder(dir, output, reskeyOutput, overwrite = false) {

    if (fs.existsSync(reskeyOutput) == true && !overwrite) {
        Settings.warningMessages += "\n" + ("## WARNING: File " + reskeyOutput + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
        return;
    };
    Settings.warningMessagesRaw = "";
    Settings.warningMessages = "";
    dir = dir.replaceAll("\\", "/");
    writeDebugLine(`## Reading the folder ${dir}...`);
    var files = listFile(dir);
    console.log(`\nTotal files: ${files.length}`);
    console.log("\n")
    Settings.result = {};
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
        let outputPath = output + relativeFilePath;
        Settings.relativeFilePath = relativeFilePath;

        if (fs.existsSync(outputPath) == true && !overwrite) {
            Settings.warningMessages += "\n" + ("## WARNING: File " + output + " already exists. Skip it. If you want to overwrite it, please use '-y' after the arguments.")
        } else {
            if (!fs.existsSync(pathLib.dirname(outputPath)))
                fs.mkdirSync(pathLib.dirname(outputPath), { recursive: true });
            if (pathLib.extname(outputPath) == '.mcfunction' || pathLib.extname(outputPath) == '.json') {
                Settings.OutputFile = fs.createWriteStream(outputPath);
                Settings.OutputFilePath = outputPath;
                transformReskeyFile_true(files[i]);
                Settings.OutputFile.end();
            } else {
                Settings.OutputFilePath = outputPath;
                Settings.OutputFile = null;
                transformReskeyFile_true(files[i]);
            }


        }
        // 拼接最终文本
        let cmdText = 'Transforming: ' + (100 * percent).toFixed(2) + '% ' + cell + empty + ' ' + i + '/' + files.length + `  Transforming: ${relativeFilePath}\n`;

        process.stdout.write(cmdText, 'utf-8');

    }

    let outputLogFile = output + "datapack_translator.log";
    if (!fs.existsSync(pathLib.dirname(outputLogFile))) fs.mkdirSync(pathLib.dirname(outputLogFile), { recursive: true });
    fs.writeFileSync(outputLogFile, Settings.warningMessagesRaw);

    if (!fs.existsSync(pathLib.dirname(reskeyOutput))) fs.mkdirSync(pathLib.dirname(reskeyOutput), { recursive: true });
    fs.writeFileSync(reskeyOutput, JSON.stringify(Settings.result, null, 4));

    process.stdout.write("Transforming: 100.00% █████████████████████████ " + files.length + "/" + files.length + "  Transforming Completed!\nLog saved to " + outputLogFile, 'utf-8');

}
function transformFile(input, output, overwrite = false) {
    if (pathLib.extname(input) == '.mcfunction') {
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

}
const HELP_CONTENT = `
Command Arguments:
[Commands 1] [Commands2] <get/apply> [files...]...

WARNING: Only 1.21.5+ support!

Supported commands:
<get/apply/reskey>                  Change transformation pattern.
                                    'get' for getting all translation keys,
                                    'apply' for applying the keys to the datapacks.
                                    'reskey' for getting keys to a resource pack language file.
-h                                  Show help texts(This).
-debug                              Show debug messages
-c <commands>                       Get keys from a command. Use '\\n' to transform multiline commands.
-nowarnings                         Do not print error messages.
-enablebinary                       [ALPHA] Transform binary files.
-norepeat                           Merge repeat texts.

For option get:
-i <input(File)> <Output File>      Transform a File.
    [-y]                            Overwrite the existed file.
-i <input(Folder)> <Output File>    Transform a Folder.
    [-y]                            Overwrite the existed file.

For option apply:
-i <Translation Key Map File>       Transform a File.
   <input(File)> <Output File> 
   [-y]                             Overwrite the existed file.
-i <Translation Key Map File>       Transform a Folder.
   <input(Folder)> <Output Folder>
   [-y]                             Overwrite the existed file.
   
For option reskey:
-i <input(File)> <Output File>      Transform a File.
   <Language File Output File>
   [-y]                             Overwrite the existed file.
-i <input(Folder)> <Output Folder>  Transform a Folder.
   <Language File Output File>
   [-y]                             Overwrite the existed file.
   `;
let argvs = process.argv;
let i = 0;
function ci_dialog() {
    console.log("\n\x1B[32mWhat do you want to do?\x1B[0m\n\x1B[33m[1] \x1B[0mTranslate commands from input.\n\x1B[33m[2] \x1B[0mTranslate commands from files/folders\n\x1B[33m[3] \x1B[0mGet help of command line arguments.\n\x1B[32mEnter the number between '[]' to continue.")
    let cont = readlineSync.question("\x1B[34mINPUT> \x1B[33m")
    if (cont == '1') {
        console.log("\x1B[32mPlease enter the command below: ")
        let cmd = readlineSync.question("\x1B[34mINPUT> \x1B[33m")
        argvs.push("-c")
        argvs.push(cmd)
    } else if (cont == '3') {
        argvs.push("-h")
    } else if (cont == '2') {
        console.log("\x1B[32mPlease enter the control you want to do below:\n\x1B[33m[get] \x1B[0mGet all translation keys.\n\x1B[33m[apply] \x1B[0mApply translation keys to the file/folder.\n\x1B[33m[reskey] \x1B[0mReplace the text with the translation key and modify the command to a file/folder.")
        let version = readlineSync.question("\x1B[35mCONTROL> \x1B[33m", {

        })
        if (version == "" || version == null) return false;
        argvs.push(version)
        console.log("\x1B[32mPlease enter the file or folder path below: ")
        argvs.push("-i")
        if (version == 'apply') {
            let inputFile2 = readlineSync.questionPath("\x1B[35mINPUT KEY MAP FILE> \x1B[33m")
            if (inputFile2 == "" || inputFile2 == null) return false;
            argvs.push(inputFile2)
        }
        let inputFile = readlineSync.questionPath("\x1B[35mINPUT FILE/FOLDER> \x1B[33m")
        if (inputFile == "" || inputFile == null) return false;

        let outputFile = readlineSync.questionPath("\x1B[36mOUTPUT FILE/FOLDER> \x1B[33m", { exists: null })
        if (outputFile == "" || outputFile == null) return false;
        argvs.push(inputFile)
        argvs.push(outputFile)
        if (version == 'reskey') {
            let outputFile2 = readlineSync.questionPath("\x1B[36mOUTPUT RESOURCE PACK LANGUAGE FILE> \x1B[33m", { exists: null })
            argvs.push(outputFile2)
            if (outputFile2 == "" || outputFile2 == null) return false;
        }
        let overwrite = readlineSync.keyInYN("\x1B[34mIf the folder exist, do you want to overwrite it?\x1B[33m")
        if (overwrite) argvs.push("-y")
    }
    console.log('\x1B[0m')
}
if (argvs.indexOf("-i") == -1 && argvs.indexOf("-h") == -1 && argvs.indexOf("-c") == -1) {
    if (ci_dialog() == false) {
        console.log("\x1B[0mUser Cancelled.")
        return;
    };
}
while (i < argvs.length) {
    let arg = argvs[i];
    if (arg == 'get') {
        transform_version = 'get';
    } else if (arg == 'apply') {
        transform_version = 'apply';
    } else if (arg == 'reskey') {
        transform_version = 'reskey';
    } else if (arg == '-h') {
        console.log(HELP_CONTENT);
        return;
    } else if (arg == '-enablebinary') {
        Settings.enableBinary = !Settings.enableBinary;
        console.log("## Enable ALPHA Features [Binary Transformation]: " + Settings.enableBinary);
    }
    else if (arg == '-nowarnings') {
        Settings.noWarnings = !Settings.noWarnings;
        console.log("## No Warnings Mode: " + Settings.noWarnings);
    } else if (arg == '-norepeat') {
        Settings.noRepeat = !Settings.noRepeat;
        console.log("## No Warnings Mode: " + Settings.noWarnings);
    } else if (arg == '-debug') {
        Settings.debugMode = !Settings.debugMode;
    } else if (arg == '-json') {
        Settings.jsonMode = !Settings.jsonMode;
    } else if (arg == '-c') {
        i++;
        if (i < argvs.length) {
            let arrs = argvs[i].split("\\n");
            for (let j = 0; j < arrs.length; j++) {
                (transformCommand(arrs[j]));
            }
        }
    } else if (arg == '-i') {
        i++;
        if (i < argvs.length) {
            let path = argvs[i];
            let content = "";

            try {
                if (transform_version == 'get') {
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
                            transformGetFolder(path, output, overWriteFiles);
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
                            transformGetFile(path, output, overWriteFiles);
                            console.log("\n" + warningMessages + `\nTotal: ${warningMessages.split("\n").length - 1} Warnings/Errors`);

                        } else {
                            console.error("## Missing output file.")
                            return;
                        }
                    }
                } else if (transform_version == 'reskey') {
                    let stats = fs.statSync(path);
                    if (stats.isDirectory()) {
                        i++;
                        if (i < argvs.length) {
                            let output = argvs[i];
                            i++;
                            let overWriteFiles = false;
                            let resOutputfile = null;
                            if (i < argvs.length) {
                                resOutputfile = argvs[i];
                                i++;

                                if (i < argvs.length) {
                                    if (argvs[i] == '-y') {
                                        overWriteFiles = true;
                                    } else i--;
                                }
                                transformReskeyFolder(path, output, resOutputfile, overWriteFiles);

                            }

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
                            let resOutputfile = null;
                            if (i < argvs.length) {
                                resOutputfile = argvs[i];
                                i++;

                                if (i < argvs.length) {
                                    if (argvs[i] == '-y') {
                                        overWriteFiles = true;
                                    } else i--;
                                }
                            }
                            transformReskeyFile(path, output, resOutputfile, overWriteFiles);
                            console.log("\n" + warningMessages + `\nTotal: ${warningMessages.split("\n").length - 1} Warnings/Errors`);

                        } else {
                            console.error("## Missing output file.")
                            return;
                        }
                    }
                } else if (transform_version == 'apply') {
                    throw new Error("Not support yet.");
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
if (Settings.warningMessages != null) {
    console.log("\n" + Settings.warningMessages + `\nTotal: ${Settings.warningMessages.split("\n").length - 1} Warnings/Errors`);
}
if (Settings.OutputFile != null) {
    Settings.OutputFile.end();
}

