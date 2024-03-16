const NBTools = {
    Class: {
        NbtObject: class { },
    },
    ParseNBT: function (NbtString) {
        let JSON_Decode = false;
        if (arguments.length > 1) {
            JSON_Decode = arguments[1];
        }
        if (typeof NbtString !== "string") {
            throw new SyntaxError("Argument is not String");
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
        for (var i = 0, item; item = NbtString[i++];) { //循环遍历每个字符
            if (Stack[Stack.length - 1] === "String") { // 判断目前是否处于字符串堆栈
                //debugger;
                var escapeLock = false; // 转义锁
                if (!escape && item === '"') {
                    Stack.pop();
                    if (StringBuffer.length === 0) {
                        setValue("");
                        continue;
                    }
                    StringBuffer = (Number(StringBuffer).toString() === StringBuffer) ? StringBuffer : parseJson(StringBuffer); // 尝试把字符串当做JSON解析
                }
                if (escape || item !== '"' && item !== "\\") {
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
                            throw new SyntaxError("Unexpect '}' In " + i);
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
                            throw new SyntaxError("Unexpect ']' In " + i);
                        }
                        break;

                    case '"':
                        if (StringBuffer !== "") {
                            throw new SyntaxError("Unexpect '\"' In " + i);
                        }
                        Stack.push("String"); // 将类型String加入堆栈 
                        break;

                    case ":":
                        if (StringBuffer === "" && NativeBuffer === "") {
                            throw new SyntaxError();
                        }
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

module.exports = {NBTools}