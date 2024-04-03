// Author: wifi_left
// 灵感来源自：https://zhuanlan.zhihu.com/p/107344979
function NBTParser(str) {
    let i = 0;
    function parseValue() {
        skipWhitespace();
        if (str[i] == '[') {
            // Array
            return parseArray();
        } else if (str[i] == '{') {
            // Array
            return parseObject();
        } else {
            return parseString();
        }
    }
    function skipWhitespace() {
        while (str[i] == ' ' || str[i] == '\n' || str[i] == '\r') i++;
    }
    function eatComma() {
        if (str[i] !== ',') {
            throw new SyntaxError('Expected "," but only found "' + str[i] + '" at ' + i);
        }
        i++;
    }
    function eatColon() {
        if (str[i] !== ':') {
            throw new SyntaxError('Expected ":" but only found "' + str[i] + '" at ' + i);
        }
        i++;
    }
    function parseString() {
        let escapeLock = false; // '\'
        let topElement = -1; // -1 for none, 0 for "", 1 for ''
        let StringBuffer = "";
        while (true) {
            if (topElement == -1) {
                if (str[i] === '}' || str[i] === ']' || str[i] === ',' || str[i] === ':') {
                    break;
                }
                if (i >= str.length) {
                    throw new SyntaxError('Unexpected ends of string.');
                }
                if (str[i] == '"') {
                    if (StringBuffer !== "") {
                        throw new SyntaxError("Unexpected '\"' at " + i);
                    }
                    topElement = 0;
                } else if (str[i] == '\'') {
                    if (StringBuffer !== "") {
                        throw new SyntaxError("Unexpected \"'\" at " + i);
                    }
                    topElement = 1;
                }
                StringBuffer = StringBuffer + str[i];

            } else if (topElement == 0) {
                if (str[i] == '"' && !escapeLock) {
                    StringBuffer = StringBuffer + str[i];
                    i++;
                    return StringBuffer;
                }
                if (escapeLock) {
                    escapeLock = false;
                } else if (str[i] == '\\') {
                    escapeLock = true;
                }
                StringBuffer = StringBuffer + str[i];

            } else if (topElement == 1) {
                if (str[i] == '\'' && !escapeLock) {
                    StringBuffer = StringBuffer + str[i];
                    i++;
                    return StringBuffer;
                }
                if (escapeLock) {
                    escapeLock = false;
                } else if (str[i] == '\\') {
                    escapeLock = true;
                }
                StringBuffer = StringBuffer + str[i];

            }
            i++;
        }
        return StringBuffer;
    }
    function parseObject() {
        if (str[i] === '{') {
            i++;
            skipWhitespace();

            // if it is not '}',
            // we take the path of string -> whitespace -> ':' -> value -> ...
            let initial = true;
            // if it is not '}',
            let map = {}
            // we take the path of string -> whitespace -> ':' -> value -> ...
            while (str[i] !== '}') {
                if (i >= str.length) {
                    throw new SyntaxError("Expected '}' at " + i + " (End)");
                }
                if (!initial) {
                    eatComma();
                    skipWhitespace();
                }
                const key = parseString();
                if (key === "" && str[i] === '}') break;
                skipWhitespace();
                eatColon();
                const value = parseValue();
                if (value === "") {
                    throw new SyntaxError("Unexpected: value of key '" + key + "' is null.");
                }
                initial = false;
                map[key] = value;
            }
            // move to the next character of '}'
            i++;
            return map;
        }
    }
    function parseArray() {
        if (str[i] === '[') {
            i++;
            skipWhitespace();

            // if it is not '}',
            // we take the path of string -> whitespace -> ':' -> value -> ...
            let initial = true;
            // if it is not '}',
            let map = []
            // we take the path of string -> whitespace -> ':' -> value -> ...
            while (str[i] !== ']') {
                if (i >= str.length) {
                    throw new SyntaxError("Expected ']' at " + i + " (End)");
                }
                if (!initial) {
                    eatComma();
                    skipWhitespace();
                }
                const value = parseValue();
                skipWhitespace();

                initial = false;
                if (value === "") continue;
                map.push(value);
            }
            // move to the next character of '}'
            i++;
            return map;
        }
    }
    if (str[i] === '{') {
        return parseObject();
    } else if (str[i] === '[') {
        return parseArray();
    } else {
        return JSON.parse(str);
    }
}
module.exports = { NBTParser }
