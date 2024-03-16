const { parseCommand, parseSelectorArg, parseItemArg, parseBlockArg, splitText, parseValues } = require("./mccommand.js");
const package = require("./package.json")
const NBTools = require("./NBTool.js").NBTools;
function writeLine(...lines) {
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i])
    }
}
let argvs = process.argv;
let i = 0;
while (i < argvs.length) {
    let arg = argvs[i];
    if (arg == '-c') {
        i++;
        if (i < argvs.length) {
            transformCommand(argvs[i]);
        }
    }
    i++;
}


function transformCommand(command) {
    try {
        let comArgs = parseCommand(command);
        writeLine(comArgs);
        writeLine(parseSelectorArg(comArgs[1]));
        writeLine(parseItemArg(comArgs[2]).tags);
    } catch (error) {
        writeLine("# 在解析命令时发生错误：" + error.message);
        console.error(error);
    }
}

writeLine("###")
writeLine("### Datapack Upgrader v" + package.version + " by " + package.author)
writeLine("### If you encounter a problem, make a issue on "+package.homepage)
writeLine("### ")