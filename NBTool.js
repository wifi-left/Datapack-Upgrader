function getNbtContent(nbttext) {
    if (nbttext === undefined) return undefined;
    if (typeof (nbttext) === 'object') {
        if (Array.isArray(nbttext)) {
            if (nbttext.length >= 1) {
                if (typeof (nbttext[0]) === 'string') {
                    if (nbttext[0].startsWith("B;") || nbttext[0].startsWith("I;") || nbttext[0].startsWith("L;")) {
                        nbttext[0] = nbttext[0].substring(2);
                        for (let i = 0; i < nbttext.length; i++) {
                            nbttext[i] = getNbtContent(nbttext[i]);
                        }
                    }
                }
            }
        }
        return nbttext;
    }
    if (typeof (nbttext) !== 'string') return nbttext;
    if (nbttext.startsWith("S;")) {
        return nbttext.substring(2);
    }
    switch (nbttext[nbttext.length - 1]) {
        case 's':
        case 'S':
        case 'b':
        case 'B':
            return parseInt(nbttext.substring(0, nbttext.length - 1));
        case 'l':
        case 'L':
            return BigInt(nbttext.substring(0, nbttext.length - 1));
        case 'f':
        case 'F':
        case 'd':
        case 'D':
            return parseFloat(nbttext.substring(0, nbttext.length - 1));
        default:
            return parseFloat(nbttext);
    }
}
function getNbtType(nbttext) {
    if (typeof (nbttext) === 'boolean') return 'boolean';
    if (typeof (nbttext) === 'object') {
        if (Array.isArray(nbttext)) {
            if (nbttext.length >= 1) {
                if (typeof (nbttext[0]) === 'string') {
                    if (nbttext[0].startsWith("B;")) return 'bytearray';
                    if (nbttext[0].startsWith("I;")) return 'intarray';
                    if (nbttext[0].startsWith("L;")) return 'longarray';

                    // || nbttext[0].startsWith("I;") || nbttext[0].startsWith("L;")) {


                }
            }
            return 'list';
        }
        return 'compound';

    }
    if (typeof (nbttext) !== 'string') return nbttext;
    if (nbttext.startsWith("S;")) {
        return 'string'
    }
    switch (nbttext[nbttext.length - 1]) {
        case 'b':
        case 'B':
            return 'byte';
        case 's':
        case 'S':
            return 'short';
        case 'l':
        case 'L':
            return 'long';
        case 'f':
        case 'F':
            return 'float';
        case 'D':
        case 'd':
            return 'float';
        default:
            let intN = parseInt(nbttext);
            let floatN = parseFloat(nbttext);
            if (floatN != nbttext) return 'unknown';
            return (intN == floatN ? 'int' : 'double');
    }
}
function warpKey(key) {

    if (typeof key !== 'string')
        throw new SyntaxError("Argument is not a String");
    var regu = /^\w+$/; // From wiki: https://zh.minecraft.wiki/w/NBT%E6%A0%BC%E5%BC%8F
    if (regu.test(key)) {
        return key;
    } else {
        return JSON.stringify(key)
    }
}
const NBTools = {
    Class: {
        NbtObject: class { },
    },
    ToString: function (NbtObject) {
        let result = "";
        let type = getNbtType(NbtObject);
        switch (type) {
            case 'intarray':
            case 'bytearray':
            case 'longarray':
                for (let i in NbtObject) {
                    result += (result == "" ? "" : ",") + NbtObject[i];
                }
                return `[${result}]`;
            case 'string':
                return JSON.stringify(getNbtContent(NbtObject));
            case 'short':
            case 'int':
            case 'long':
            case 'float':
            case 'double':
            case 'byte':
                return NbtObject;
            case 'compound':
                for (let key in NbtObject) {
                    if (NbtObject[key] != undefined)
                        result += (result == "" ? "" : ",") + warpKey(key) + ":" + this.ToString(NbtObject[key]);
                }
                return "{" + result + "}";
            case 'list':
                for (let i in NbtObject) {
                    result += (result == "" ? "" : ",") + this.ToString(NbtObject[i]);
                }
                return "[" + result + "]";
            default:
                return JSON.stringify(NbtObject);
        }
    },
    ParseNBT: function (NbtString) {
        let JSON_Decode = false;
        if (arguments.length > 1) {
            JSON_Decode = arguments[1];
        }
        if (typeof NbtString !== "string") {
            throw new SyntaxError("Argument is not a String");
        }
        function setValue(value) {
            IndexList[IndexList.length - 1][Keys[Keys.length - 1]] = value;
            return IndexList[IndexList.length - 1][Keys[Keys.length - 1]];
        }
        function parseJson(str) {
            if (!JSON_Decode) return str
            if (typeof str === 'string') {
                try {
                    var str = JSON.parse(str);
                } catch (err) {
                    return str
                }
            }
            if (typeof str === 'object') {
                for (let item of Object.keys(str)) {
                    str[item] = parseJson(str[item]);
                }
            }
            return str;
        }
        function NaviteBufferEscape(value) {
            if (value === "true") {
                return true;
            } else if (value === "false") {
                return false;
            } else {
                return value.toString();
            }
        }
        var Stack = []; // 类型堆栈
        var NbtObject = new this.Class.NbtObject();
        var StringBuffer = ""; //字符串缓冲区
        var NativeBuffer = ""; // 自然关键字缓冲区
        var ItemStep = 0; // 冒号位置
        var escape = false; //是否处于转义状态
        var Keys = []; // 索引列表 (名称)
        var IndexList = [NbtObject]; // 索引列表(引用)
        for (var i = 0, item; item = NbtString[i]; i++) { //循环遍历每个字符
            if (Stack[Stack.length - 1] === "String" || Stack[Stack.length - 1] === "StringD") { // 判断目前是否处于字符串堆栈
                //debugger;
                let quoteType = Stack[Stack.length - 1];
                var escapeLock = false; // 转义锁
                if (!escape && (item === '"' && quoteType !== 'StringD') || item === '\'') {
                    Stack.pop();
                    if (StringBuffer.length === 0) {
                        setValue("");
                        continue;
                    }
                    StringBuffer = (Number(StringBuffer).toString() === StringBuffer) ? StringBuffer : parseJson(StringBuffer); // 尝试把字符串当做JSON解析
                }
                if (escape || quoteType == 'StringD' && item === '"' || item !== '"' && item !== '\'' && item !== "\\") {

                    StringBuffer += item; //添加字符到字符串缓冲区
                }
                if (escape) {
                    escape = false;
                    escapeLock = true;
                }
                if (!escapeLock && item === "\\") {
                    escape = true;
                }
                continue;
            } else {
                switch (item) {
                    case "{":
                        if (ItemStep === 1) {
                            var rValue = setValue({}); // 设置目前元素的值
                            IndexList.push(rValue);
                            ItemStep = 0;
                        }
                        Stack.push("Object"); // 将类型Object加入堆栈 
                        break;

                    case "}":
                        if (ItemStep === 1) {
                            if (NativeBuffer !== "") {
                                var rValue = setValue(NaviteBufferEscape.call(this, NativeBuffer)); // 设置目前元素的值
                                NativeBuffer = "";
                                Keys.pop();
                            } else if (StringBuffer !== "") {
                                var rValue = setValue(StringBuffer); // 设置目前元素的值
                                StringBuffer = "";
                                Keys.pop();
                            }
                        }
                        IndexList.pop();
                        if (Stack.length !== 1) {
                            if (Stack[Stack.length - 2] !== "Array") {
                                Keys.pop();
                            }
                        }
                        if (Stack.pop() !== "Object") {
                            throw new SyntaxError("Unexpect '}' in " + i);
                        }
                        break;

                    case "[":
                        if (ItemStep === 1) {
                            var rValue = setValue([]); // 设置目前元素的值
                            IndexList.push(rValue);
                        }
                        Keys.push(0);
                        Stack.push("Array"); // 将类型Array加入堆栈 
                        ItemStep = 1;
                        break;

                    case "]":
                        if (ItemStep === 1) {
                            if (NativeBuffer !== "") {
                                var rValue = setValue(NaviteBufferEscape.call(this, NativeBuffer)); // 设置目前元素的值
                                NativeBuffer = "";
                            } else if (StringBuffer !== "") {
                                var rValue = setValue(StringBuffer); // 设置目前元素的值
                                StringBuffer = "";
                            }
                        }
                        IndexList.pop();
                        Keys.pop();
                        if (Stack.pop() !== "Array") {
                            throw new SyntaxError("Unexpect ']' in " + i);
                        }
                        break;

                    case '"':
                        if (StringBuffer !== "") {
                            throw new SyntaxError("Unexpect '\"' in " + i);
                        }
                        StringBuffer = 'S;';
                        Stack.push("String"); // 将类型String加入堆栈 
                        break;
                    case '\'':
                        if (StringBuffer !== "") {
                            throw new SyntaxError("Unexpect \"'\" in " + i);
                        }
                        StringBuffer = 'S;';
                        Stack.push("StringD"); // 将类型StringD加入堆栈 
                        break;
                    case ":":
                        if (StringBuffer === "" && NativeBuffer === "") {
                            throw new SyntaxError();
                        }
                        if (StringBuffer.startsWith("S;")) StringBuffer = StringBuffer.substring(2);
                        Keys.push(StringBuffer !== "" ? StringBuffer : NativeBuffer); // 添加 变量名到堆栈
                        if (StringBuffer === "") {
                            NativeBuffer = "";
                        } else {
                            StringBuffer = "";
                        }
                        ItemStep = 1;
                        break;

                    case ",":
                        if (StringBuffer !== "") {
                            var rValue = setValue(StringBuffer); // 设置目前元素的值
                            StringBuffer = "";
                            if (Stack[Stack.length - 1] !== "Array") {
                                Keys.pop();
                            }
                        } else if (NativeBuffer !== "") {
                            var rValue = setValue(NaviteBufferEscape.call(this, NativeBuffer)); // 设置目前元素的值
                            NativeBuffer = "";
                            if (Stack[Stack.length - 1] !== "Array") {
                                Keys.pop();
                            }
                        } else {
                            if (Stack[Stack.length - 1] !== "Array") {
                                Keys.pop();
                            }
                        }
                        if (Stack[Stack.length - 1] !== "Array") {
                            ItemStep = 0;
                        } else {
                            ItemStep = 1;
                            Keys[Keys.length - 1]++;
                        }
                        break;

                    default:
                        //debugger;
                        NativeBuffer += item;
                        break;
                }
            }
        }
        return NbtObject;
    }
};

module.exports = { NBTools, getNbtContent, getNbtType, warpKey }