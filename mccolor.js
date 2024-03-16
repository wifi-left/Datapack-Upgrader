const supportColors = [
    "black",
    "dark_blue",
    "dark_green",
    "dark_aqua",
    "dark_red",
    "dark_purple",
    "gold",
    "gray",
    "dark_gray",
    "blue",
    "green",
    "aqua",
    "red",
    "light_purple",
    "yellow",
    "white",
    "reset"
]
const MCColorMap = {
    "0": "black",
    "1": "dark_blue",
    "2": "dark_green",
    "3": "dark_aqua",
    "4": "dark_red",
    "5": "dark_purple",
    "6": "gold",
    "7": "gray",
    "8": "dark_gray",
    "9": "blue",
    "a": "green",
    "b": "aqua",
    "c": "red",
    "d": "light_purple",
    "e": "yellow",
    "f": "white",
    "r": "reset"
}
function TEXTtoHTML(TEXT) {
    if (TEXT == undefined) TEXT = "";
    var ele = document.createElement("div");
    // document.appendChild(ele);
    ele.innerText = TEXT;
    var result = ele.innerHTML.toString().replaceAll(" ", "&nbsp;");
    // document.removeChild(ele);
    return result;
}
/**
 * 解析 Minecraft 聊天器文本（JSON）
 * @param JSON {String} 需要解析的文本
 * @return {String} 解析后的文本
 * @author wifi-left
 */
function mcChat(JSON) {
    function parseMCJson(JSON) {
        var Type = Array.isArray(JSON); //true: []; false:{} or '';
        Total = '';
        if (Type) {
            for (var i = 0; i <= JSON.length; i++) {
                Total += parseMCJson(JSON[i]);
            }
        } else {
            Type = typeof (JSON);
            if (Type == "object") {
                var color = JSON['color'];
                var bold = false, itlian = false, underline = false, deleteline = false, random = false;
                if (JSON['bold'] == true || JSON['bold'] == "true") {
                    bold = true;
                }
                if (JSON['italic'] == true || JSON['italic'] == "true") {
                    itlian = true;
                }
                if (JSON['underlined'] == true || JSON['underlined'] == "true") {
                    underline = true;
                }
                if (JSON['strikethrough'] == true || JSON['strikethrough'] == "true") {
                    deleteline = true;
                }
                if (JSON['obfuscated'] == true || JSON['obfuscated'] == "true") {
                    random = true;
                }
                if (color == undefined) {
                    color = "reset";
                }
                if (supportColors.indexOf(color) != -1) {
                    Total += `<span class="mcColor-${color}">`;
                } else {
                    Total += `<span style="color:${color};">`;
                }
                var Prefix = `${bold ? "§l" : ""}${random ? "§k" : ""}${underline ? "§n" : ""}${deleteline ? "§m" : ""}${itlian ? "§o" : ""}`;
                if (JSON['score'] != undefined) {
                    Total += mcColor(Prefix + JSON['score']['value'] + "(" + JSON['score']['name'] + " in " + JSON['score']['objective'] + ")");
                } else if (JSON['selector'] != undefined) {
                    Total += mcColor(Prefix + HTMLEncode(JSON['selector']));
                } else if (JSON['translation'] != undefined) {
                    Total += mcColor(Prefix + (JSON['translation']));
                } else {
                    Total += mcColor(Prefix + (JSON['text']));
                }
                Total += "</span>"

                if (JSON['extra'] != undefined) {
                    Total += parseMCJson(JSON['extra']);
                }
            } else {
                Total += "<span class='mcColor-reset'>" + mcColor(JSON) + "</span>";
            }
        }
        return Total;
        // console.log(Type);
    }
    var Text = parseMCJson(JSON);
    return (Text);
}
var str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
function getRandomStr(n) {
    var res = "";
    for (var i = 0; i < n; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += str[id];
    }
    return res;
}
/**
 * 解析 Minecraft 文本（§格式）
 * @param Text {String} 需要解析的文本
 * @return {String} 解析后的文本（HTML）
 * @author wifi-left
 */
function mcColor(Text) {
    try {
        Text = Text.toString();
    } catch (e) {
        // console.log(Text);
        return "";
    }
    var Txt = "";
    var idx = 0, i = 0, color = "none";
    idx = Text.indexOf("§", idx);
    var bold = false, itlian = false, underline = false, deleteline = false, random = false;
    while (idx != -1) {
        var content = TEXTtoHTML(Text.substring(i, idx));
        if (random) {
            content = getRandomStr(content.length);
        }
        Txt += `${bold ? "<b>" : ""}${itlian ? "<i>" : ""}${deleteline ? "<del>" : ""}${underline ? "<u>" : ""}<span class="mcColor-${color}${random ? " MCrandomText" : ""}">${content}</span>${bold ? "</b>" : ""}${itlian ? "</i>" : ""}${deleteline ? "</del>" : ""}${underline ? "</u>" : ""}`;
        if (idx + 1 < Text.length) {
            var Ccolor = Text[idx + 1];
            /*
            §k	随机字符
            §l	粗体
            §m	删除线
            §n	下划线
            §o	斜体
            §r	重置文字样式
            */
            if (Ccolor == "l") {
                bold = true;
            } else if (Ccolor == "o") {
                itlian = true;
            } else if (Ccolor == "m") {
                deleteline = true;
            } else if (Ccolor == "n") {
                underline = true;
            } else if (Ccolor == "k") {
                random = true;
            } else {
                color = MCColorMap[Ccolor];
                if (color == undefined) color = "none";
                bold = false, itlian = false, underline = false, deleteline = false, random = false;
            }
        }
        i = idx + 2;
        idx = Text.indexOf("§", idx + 2);
    }
    var content = TEXTtoHTML(Text.substring(i, Text.length));
    if (random) {
        content = getRandomStr(content.length);
    }
    Txt += `${bold ? "<b>" : ""}${itlian ? "<i>" : ""}${deleteline ? "<del>" : ""}${underline ? "<u>" : ""}<span class="mcColor-${color}${random ? " MCrandomText" : ""}">${content}</span>${bold ? "</b>" : ""}${itlian ? "</i>" : ""}${deleteline ? "</del>" : ""}${underline ? "</u>" : ""}`;
    return (Txt);
}
