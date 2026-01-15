const fs = require("fs");
const pathLib = require("path");
const zlib = require("zlib");
const lz4 = require("lz4");
const Stream = require('stream');
const { NBTStream } = require("./nbtstream.js");
const { JavaBufferUtils } = require("./java_buffer_utils.js");

const NBTFILE_SNBT_TOOL = {
    ToSNBT: function (MCNBT) {
        function __pack(data) {
            let root = {};
            function parse_main(dat) {
                let t = dat.getType();
                return parse_body(dat, t);
            }
            function parse_body(dat, t) {
                if (t == 'compound') {
                    return parse_compound(dat);
                } else if (t == 'byte_array') {
                    return parse_number_list(dat.getValue(), "byte");
                } else if (t == 'int_array') {
                    return parse_number_list(dat.getValue(), "int");
                } else if (t == 'long_array') {
                    return parse_number_list(dat.getValue(), "long");
                } else if (t == 'list') {
                    return parse_list(dat.getValue());
                } else if (t == 'string') {
                    let str = (dat.getValue());
                    return JSON.stringify(str);
                } else {
                    return pack_num(dat);
                }
            }
            function pack_num(dat) {
                let t = dat.getType();
                if (t == 'byte') {
                    return dat.getValue() + "b";
                } else if (t == 'int') {
                    return dat.getValue() + "";
                } else if (t == 'long') {
                    return dat.getValue() + "l";
                } else if (t == 'float') {
                    return dat.getValue() + "f";
                } else if (t == 'double') {
                    return dat.getValue() + "d";
                } else
                    return dat.getValue();
            }
            function parse_number_list(dat, type) {
                let arrLen = dat.length;
                let res = "";
                let prefix = "I";
                if (type == 'byte') {
                    prefix = "B";
                } else if (type == 'int') {
                    prefix = "I";
                } else if (type == 'long') {
                    prefix = "L";
                }
                let arr = new Array();
                for (let i = 0; i < arrLen; i++) {
                    arr[i] = pack_num(dat[i]);
                }
                if (arr[0] != null) {
                    arr[0] = `${prefix};${arr[0]}`;
                } else {
                    arr[0] = `${prefix};`;
                }
                return arr;
            }
            function parse_list(dat) {
                let arrLen = dat.length;
                let arr = new Array();
                for (let i = 0; i < arrLen; i++) {
                    arr[i] = parse_main(dat[i]);
                }
                return arr;
            }
            function parse_compound(dat) {
                let __map = dat.getValue();


                let rt = {};
                let count = 0, last_key = null;
                for (let key in __map) {
                    count++;
                    last_key = key;
                    let ele = __map[key];
                    rt[key] = parse_main(ele);
                }
                if (count == 1 && last_key == "") {
                    return rt[last_key];
                };
                return rt;
            }
            root = parse_compound(data);
            return root;
        }
        return __pack(MCNBT);
    },
    ToMCNBT: function (SNBTObject) {
        function __getNbtContent(nbttext) {
            if (nbttext === undefined) return undefined;
            if (typeof nbttext === 'boolean') return nbttext;
            if (typeof nbttext === 'object') {
                if (Array.isArray(nbttext)) {
                    if (nbttext.length >= 1) {
                        if (typeof (nbttext[0]) === 'string') {
                            if (nbttext[0].startsWith("B;") || nbttext[0].startsWith("I;") || nbttext[0].startsWith("L;")) {
                                nbttext[0] = nbttext[0].substring(2);
                                for (let i = 0; i < nbttext.length; i++) {
                                    nbttext[i] = __getNbtContent(nbttext[i]);
                                }
                            }
                        }
                    }
                }
                return nbttext;
            }
            if (typeof (nbttext) !== 'string') return nbttext;
            if (nbttext.startsWith("\"")) {
                return JSON.parse(nbttext);
            } else if (nbttext.startsWith("'")) {
                return (nbttext.substring(1, nbttext.length - 1).replaceAll("\\\\", "\\"));
            }
            if (nbttext.length <= 1) return nbttext;

            if (('0' > nbttext[0] || nbttext[0] > '9') && (nbttext[0] != '-' && nbttext[0] != "."))
                return nbttext;

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
                    if (nbttext[0] == '.') nbttext = "0" + nbttext;

                    // console.log()
                    let floatN = parseFloat(nbttext);
                    return floatN;
            }
        }
        function __getNbtType(nbttext) {

            if (typeof (nbttext) === 'boolean') return 'byte';
            if (typeof (nbttext) === 'object') {
                if (Array.isArray(nbttext)) {
                    if (nbttext.length >= 1) {
                        if (typeof (nbttext[0]) === 'string') {
                            if (nbttext[0].startsWith("B;")) return 'byte_array';
                            if (nbttext[0].startsWith("I;")) return 'int_array';
                            if (nbttext[0].startsWith("L;")) return 'long_array';

                            // || nbttext[0].startsWith("I;") || nbttext[0].startsWith("L;")) {


                        }
                    }
                    return 'list';
                }
                return 'compound';

            }
            if (typeof (nbttext) !== 'string') {
                if (typeof (nbttext) == 'number') {
                    if (parseInt(nbttext) == nbttext)
                        return 'int';
                    else return 'double';
                }
                if (typeof (nbttext) == 'bigint') return 'long';
            }
            if (nbttext.startsWith("\"")) {
                return 'string';
            } else if (nbttext.startsWith("'")) {
                return 'string';
            }
            if (nbttext.length > 2)
                if (('0' > nbttext[0] || nbttext[0] > '9') && nbttext[0] != '-' && nbttext[0] != '.') {
                    return 'string';
                }
            if (nbttext[0] == '.') nbttext = "0" + nbttext;
            let intN = null;
            let floatN = null;
            let tempStr = nbttext;
            switch (nbttext[nbttext.length - 1]) {
                case 'b':
                case 'B':
                    tempStr = nbttext.substring(0, nbttext.length - 1);
                    intN = parseInt(tempStr);
                    if (intN != tempStr) return 'string'
                    return 'byte';
                case 's':
                case 'S':
                    tempStr = nbttext.substring(0, nbttext.length - 1);
                    intN = parseInt(tempStr);
                    if (intN != tempStr) return 'string'
                    return 'short';
                case 'l':
                case 'L':
                    tempStr = nbttext.substring(0, nbttext.length - 1);
                    intN = parseInt(tempStr);
                    if (intN != tempStr) return 'string'
                    return 'long';
                case 'f':
                case 'F':
                    if (nbttext[0] == '.') nbttext = "0" + nbttext;
                    else if (nbttext[0] == '-' && nbttext[1] == '.') nbttext = "-0" + nbttext.substring(1);

                    tempStr = nbttext.substring(0, nbttext.length - 1);
                    if (tempStr[tempStr.length - 1] == '.') tempStr.substring(0, tempStr.length - 1);
                    intN = parseFloat(tempStr);
                    if (intN != tempStr) return 'string'
                    return 'float';
                case 'D':
                case 'd':
                    if (nbttext[0] == '.') nbttext = "0" + nbttext;
                    else if (nbttext[0] == '-' && nbttext[1] == '.') nbttext = "-0" + nbttext.substring(1);

                    tempStr = nbttext.substring(0, nbttext.length - 1);
                    if (tempStr[tempStr.length - 1] == '.') tempStr.substring(0, tempStr.length - 1);
                    intN = parseFloat(tempStr);
                    if (intN != tempStr) return 'string';
                    return 'double';
                default:
                    if (nbttext[0] == '.') nbttext = "0" + nbttext;
                    intN = parseInt(nbttext);
                    floatN = parseFloat(nbttext);
                    if (floatN != nbttext) return 'unknown';
                    return (intN == floatN ? 'int' : 'double');
            }
        }
        function __decode(NbtObject) {

            if (NbtObject == null) return null;
            let type = __getNbtType(NbtObject);
            let rt = new MCNBT(type, "");

            let val = __getNbtContent(NbtObject);
            let subtype = null;
            switch (type) {
                case 'int_array':
                case 'byte_array':
                case 'long_array':
                    if (type == 'int_array') subtype = 'int';
                    else if (type == 'byte_array') subtype = 'byte';
                    else if (type == 'long_array') subtype = 'long';
                    for (let i = 0; i < val.length; i++) {
                        val[i] = new MCNBT(subtype, val[i]);
                    }
                    break;
                case 'compound':
                    for (let key in NbtObject) {
                        // console.log(NbtObject[key]!=undefined)                  
                        if (NbtObject[key] != undefined) {
                            NbtObject[key] = __decode(NbtObject[key]);
                        }
                    }
                    break;
                case 'list':
                    let isComplicated = false;
                    let listType = null;
                    for (let i = 0; i < NbtObject.length; i++) {
                        if (listType == null) {
                            listType = __getNbtType(NbtObject[i]);

                        } else if (listType != __getNbtType(NbtObject[i])) {
                            isComplicated = true;
                            break;
                        }
                    }
                    for (let i = 0; i < NbtObject.length; i++) {
                        if (isComplicated) {
                            if (__getNbtType(NbtObject[i]) == 'compound') {
                                NbtObject[i] = __decode(NbtObject[i]);
                            } else {
                                NbtObject[i] = new MCNBT("compound", { "": __decode(NbtObject[i]) });
                            }
                        } else {
                            NbtObject[i] = __decode(NbtObject[i]);
                        }

                    }
                    // 
                    break;
            }
            rt.setValue(val);
            return rt;

        }
        return __decode(SNBTObject);
    }
}

class MCNBT {
    constructor(type = 'default', value = null) {
        this._type = type;
        this._value = value;

        // 创建一个Proxy包装实例
        const proxy = new Proxy(this, {
            get: function (target, prop) {
                // 如果直接访问实例本身（没有属性名），返回value
                if (prop === Symbol.toPrimitive || prop === 'valueOf') {
                    return () => target.getValue();
                }

                // 添加 toJSON 方法的处理
                if (prop === 'toJSON') {
                    return () => target.toJSON();
                }

                // 访问value属性时返回_value
                if (prop === 'value') {
                    return target._value;
                }

                // 访问type属性时返回_type
                if (prop === 'type') {
                    return target._type;
                }

                // 访问其他属性
                return target[prop];
            },

            set: function (target, prop, newValue) {
                // 如果直接对实例赋值，设置value
                if (prop === '_value' || prop === 'value') {
                    target.setValue(newValue);
                    return true;
                }

                // 允许直接修改type
                if (prop === '_type' || prop === 'type') {
                    target.setType(newValue);
                    return true;
                }

                // 设置其他属性
                target[prop] = newValue;
                return true;
            }
        });

        return proxy;
    }

    // 添加 toJSON 方法
    toJSON() {
        // 直接返回 value 的值
        return this.getValue();
    }

    // 修改type
    setType(newType) {
        this._type = newType;
        return this;
    }

    // 获取type
    getType() {
        return this._type;
    }
    getBufData() {
        if (!Buffer.isBuffer(this._value)) {
            let ret_val = this._value;
            const supportNumberTypes = ['byte', 'short', 'int', 'long', 'float', 'double'];
            if (supportNumberTypes.includes(this._type))
                ret_val = JavaBufferUtils.toBuffer(this._value, this._type)

            return (ret_val);
        }
        return this._value;
    }
    // 获取value
    getValue() {
        let ret_val = this._value;
        if (Buffer.isBuffer(this._value)) {
            const supportNumberTypes = ['byte', 'short', 'int', 'long', 'float', 'double', 'string'];
            if (supportNumberTypes.includes(this._type))
                ret_val = JavaBufferUtils.fromBuffer(this._value, this._type)
            else
                throw new Error(`Unknown buffer type '${this._type}'!`);
        }
        if (typeof ret_val === "bigint") {
            ret_val = ret_val.toString();
        }
        return ret_val;
    }

    // 设置value
    setValue(newValue) {
        this._value = newValue;
        if (!Buffer.isBuffer(this._value)) {
            const supportNumberTypes = ['byte', 'short', 'int', 'long', 'float', 'double'];
            if (supportNumberTypes.includes(this._type))
                this._value = JavaBufferUtils.toBuffer(newValue, this._type)
        }

        return this;
    }

    // toString方法，让console.log输出更友好
    toString() {
        return this.getValue().toString();
    }

    // valueOf方法，让类型转换时返回value
    valueOf() {
        return this.getValue();
    }

    // Symbol.toPrimitive，定义对象转换为原始值的行为
    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return String(this.getValue());
        }
        return this.getValue();
    }
}

class MCA_HEADER {
    constructor(x = 0, z = 0, offset = 0, length = 0, data = null, timestamp = null) {
        this.x = x;
        this.z = z;
        this.offset = offset;
        this.bufferOffset = 4 * 1024 * offset;
        this.length = length;
        this.bufferLength = 4 * 1024 * length;
        this.data = data; //存储时使用，读取不使用
        this.timestamp = timestamp;
    }
}
function read_bytes_with_length(data, offset, length) {
    let __res = Buffer.alloc(length);
    if (offset + length > data.length) {
        length = data.length - offset;
    }
    data.copy(__res, 0, offset, offset + length);
    return __res;
}

function NBTFILE_PARSER(data = null) {
    this.content = data;
    this.load_from_raw_data = function (data) {
        this.content = data;
        return this;

    }
    this.load_from_gzip_data = function (data) {
        this.content = data;
        try {
            const compressedData = Buffer.from(this.content); // gzip压缩数据
            const decompressedData = zlib.gunzipSync(compressedData);
            this.content = decompressedData;
        } catch (error) {
            throw new Error('Unzip error: ', error);
            return false;
        }
        return true;
    }

    this.try_load_file_with_gzip = function (path) {
        let dt = fs.readFileSync(path);

        try {
            return this.load_from_gzip_data(dt);
        } catch (e) {
            this.load_from_raw_data(dt);
            return false;

        }

    }
    this.load_file_with_gzip = function (path) {
        return this.load_from_gzip_data(fs.readFileSync(path));
    }
    this.parse = function () {
        let buffers = Buffer.from(this.content);
        return __parse(buffers);
    }
    this.__DEBUG_showRawData = function (path) {
        let buffers = Buffer.from(this.content);
        let t = "";
        for (let i = 0; i < buffers.length; i++) {
            t = t + buffers[i] + "\r\n";
        }
        fs.writeFileSync(path, t);
    }
    function __parse(data) {
        let i = 0;
        function read_type() {
            let type = data[i];
            i++;//下一位
            return type;
        }
        function read_tagname() {
            return read_string();
        }
        function read_string() {
            let tag_length = null;
            let a = data[i];
            i += 1;
            let b = data[i];
            i += 1;
            tag_length = a * 256 + b;
            let tag_name = Buffer.alloc(tag_length, 0);

            data.copy(tag_name, 0, i, i + tag_length);
            i += tag_length;
            return tag_name;
        }
        function read_bytes_with_length(length) {
            let __res = Buffer.alloc(length);
            data.copy(__res, 0, i, i + length);
            i += length;
            return __res;
        }
        function read_array_length() {
            return JavaBufferUtils.fromInt(read_bytes_with_length(4));
        }
        function split_buffers(buf, len, type) {
            let __res = new Array();
            for (let i = 0; i < buf.length; i += len) {
                let newBuf = Buffer.alloc(len);
                buf.copy(newBuf, 0, i, i + len);
                if (type == 'raw')
                    __res.push(newBuf);
                else __res.push(new MCNBT(type, newBuf))
            }
            return __res;
        }
        function read_list() {
            let type = read_type();
            let len = read_array_length();
            let __res = new Array();
            for (let i = 0; i < len; i++) {
                __res.push(read_specific_data(type));
            }
            return __res;
        }
        function read_specific_data(type) {
            if (type == 0) {
                return null;
            } else {
                let val = null;
                let len = 0;
                if (type == 1) {
                    //byte
                    val = read_bytes_with_length(1);
                    return new MCNBT("byte", val);
                } else if (type == 2) {
                    //short
                    val = read_bytes_with_length(2);
                    return new MCNBT("short", val);
                } else if (type == 3) {
                    //int
                    val = read_bytes_with_length(4);
                    return new MCNBT("int", val);
                } else if (type == 4) {
                    //long
                    val = read_bytes_with_length(8);
                    return new MCNBT("long", val);
                } else if (type == 5) {
                    //float
                    val = read_bytes_with_length(4);
                    return new MCNBT("float", val);
                } else if (type == 6) {
                    //double
                    val = read_bytes_with_length(8);
                    return new MCNBT("double", val);
                } else if (type == 7) {
                    //byte array
                    len = read_array_length();
                    val = split_buffers(read_bytes_with_length(len * 1), 1, "byte");
                    return new MCNBT("byte_array", val);
                } else if (type == 8) {
                    //string
                    val = read_string();
                    return new MCNBT("string", val);
                } else if (type == 9) {
                    //list
                    val = read_list();
                    return new MCNBT("list", val);
                } else if (type == 10) {
                    //compound
                    val = read_compound();
                    return val;
                } else if (type == 11) {
                    //int array
                    len = read_array_length();
                    val = split_buffers(read_bytes_with_length(len * 4), 4, "int");
                    return new MCNBT("int_array", val);
                } else if (type == 12) {
                    //long array
                    len = read_array_length();
                    val = split_buffers(read_bytes_with_length(len * 8), 8, "long");
                    return new MCNBT("long_array", val);
                }
            }
        }
        function read_compound() {
            let __map = {};
            while (i < data.length) {
                let type = read_type();
                // console.log(type,name.toString())
                if (type == 0) {
                    let __res = new MCNBT("compound", __map);
                    return __res;
                } else {
                    let name = read_tagname();
                    let val = read_specific_data(type);
                    __map[name] = val;
                }
            }
            throw new Error(`Incomplete compounds. Are these data really in the NBT format of Minecraft? (out of array)`);
        }
        let type = read_type();
        let name = read_tagname();
        if (type == 10) return read_compound();
        else throw new Error(`Unknown data type '${type}' ! Are these data really in the NBT format of Minecraft? (unknown type)`);

    }
}

function NBTFILE_SAVER(raw_data = null) {
    this.raw_data = raw_data;
    this.fromBuffer = function (data) {
        this.raw_data = data;
        return this;
    }
    this.fromMCNBT = function (data) {
        this.raw_data = __pack(data);
        return this;
    }
    this.save_with_gzip = function (path) {
        let _val = this.get_gzip_raw();
        fs.writeFileSync(path, _val);
        return this;
    }
    this.save_nogzip = function (path) {
        let _val = this.get_raw();
        fs.writeFileSync(path, _val);
        return this;
    }

    this.get_gzip_raw = function () {
        return zlib.gzipSync(this.raw_data);
    }
    this.get_raw = function () {
        return this.raw_data;
    }
    function getTypeId(type) {
        let id = 0;
        switch (type) {
            case 'byte':
                id = 1;
                break;
            case 'short':
                id = 2;
                break;
            case 'int':
                id = 3;
                break;
            case 'long':
                id = 4;
                break;
            case 'float':
                id = 5;
                break;
            case 'double':
                id = 6;
                break;
            case 'byte_array':
                id = 7;
                break;
            case 'string':
                id = 8;
                break;
            case 'list':
                id = 9;
                break;
            case 'compound':
                id = 10;
                break;
            case 'int_array':
                id = 11;
                break;
            case 'long_array':
                id = 12;
                break;
        }
        return id;
    }
    function __pack(data) {
        const bufs = new NBTStream()
        function parse_main(dat, name) {
            let t = dat.getType();

            let id = getTypeId(t);
            let name_buf = Buffer.from(name);
            let name_len = name_buf.length;
            if (name_len >= 65536) {
                throw new Error(`The length of the tag name ${name_len}, which is greater than the maximum value of 65535.`);
            }
            let prefix_buf = Buffer.alloc(3 + name_len); //1 id 2-3 len 4+ name
            prefix_buf[0] = id;
            JavaBufferUtils.toShort(name_len).copy(prefix_buf, 1, 0, 2);
            name_buf.copy(prefix_buf, 3, 0, name_len);
            bufs.write(prefix_buf);
            // console.log(name)

            parse_body(dat, t);
        }
        function parse_body(dat, t) {
            if (t == 'compound') {
                parse_compound(dat);
                bufs.write(Buffer.from([0]));
            } else if (t == 'byte_array') {
                parse_number_list(dat.getValue());
            } else if (t == 'int_array') {
                parse_number_list(dat.getValue());
            } else if (t == 'long_array') {
                parse_number_list(dat.getValue());
            } else if (t == 'list') {
                parse_list(dat.getValue());
            } else if (t == 'string') {
                let str = (dat.getValue());
                let strBuf = Buffer.from(str);
                let bufLen = strBuf.length;
                if (bufLen >= 65536)
                    throw new Error(`The length of the tag name ${name_len}, which is greater than the maximum value of 65535.`);
                let bufLenBuf = JavaBufferUtils.toShort(bufLen);
                bufs.write(bufLenBuf);
                bufs.write(strBuf);
            } else {
                bufs.write(dat.getBufData())
            }
        }
        function parse_number_list(dat) {
            let arrLen = dat.length;
            let arrLenBuf = JavaBufferUtils.toInt(arrLen);
            bufs.write(arrLenBuf);
            for (let i = 0; i < arrLen; i++) {
                bufs.write(dat[i].getBufData());
            }
        }
        function parse_list(dat) {
            let arrLen = dat.length;
            let arrLenBuf = JavaBufferUtils.toInt(arrLen);
            let typeId = 0;
            let t = null;
            if (arrLen > 0) {
                t = dat[0].getType();
                typeId = getTypeId(t);
            }
            bufs.write(Buffer.from([typeId]));
            bufs.write(arrLenBuf);

            for (let i = 0; i < arrLen; i++) {
                parse_body(dat[i], t);
            }
        }
        function parse_compound(dat) {
            let __map = dat.getValue();
            for (let key in __map) {
                let ele = __map[key];
                parse_main(ele, key);
            }
        }
        bufs.write(Buffer.from([10, 0, 0]));
        parse_compound(data)
        bufs.write(Buffer.from([0]));
        bufs.end();
        return bufs.getBuffer();
    }
}

function MCAFILE_PARSER(data = null) {
    this.content = data;
    this.headers = new Array();
    this.path = null;
    this.load_from_raw_data = function (data) {
        this.content = data;
    }
    this.load_file = function (path) {
        this.path = path;
        return this.load_from_raw_data(fs.readFileSync(this.path));
    }
    this.parse_header = function () {
        this.headers = __parse_header(this.content);
    }
    this.get_region_header = function (chunkX, chunkZ) {
        if (this.headers == null) {
            throw new Error(`You should first call the "parse_header" function to initialize the data.`);
        }
        for (let i = 0; i < this.headers.length; i++) {
            if (this.headers[i].x == chunkX && this.headers[i].z == chunkZ) {
                return this.headers[i];
            }
        }
        return null;
    }
    this.parse_all_region_data = function () {
        for (let i = 0; i < this.headers.length; i++) {
            let tester = this.parse_region_data(this.headers[i]);
            this.headers[i].data = tester.content;
        }
        return this.headers;
    }
    this.parse_region_data = function (mcainfo) {
        if (mcainfo == null) {
            throw new Error(`You should first call the "parse_header" function to initialize the data.`);
        }

        return __parse_region(this.content, mcainfo, this.path);
    }
    function __parse_region(data, regioninfo, path = null) {
        let dat = Buffer.from(data);
        if (regioninfo.offset < 2) {
            throw new Error(`Region data has invalid sector at index: (${x},${z}); sector ${offset} overlaps with header`);

        }
        if (regioninfo.offset == 0) {
            throw new Error(`Region data has invalid sector at index: (${x},${z}); sector ${offset} overlaps with header`);
        }
        if (regioninfo.bufferOffset >= dat.length) {
            throw new Error(`Region data has an invalid sector at index: $(${regioninfo.x},${regioninfo.z}); sector ${regioninfo.offset} is out of bounds`);
        }

        let rdata = read_bytes_with_length(dat, regioninfo.bufferOffset, regioninfo.bufferLength);
        // console.log(rdata)
        let __num_1 = rdata[0];
        let __num_2 = rdata[1];
        let __num_3 = rdata[2];
        let __num_4 = rdata[3];
        let tlength = __num_1 * 256 * 256 * 256 + __num_2 * 256 * 256 + __num_3 * 256 + __num_4;
        let compressType = rdata[4];
        let tdata = read_bytes_with_length(rdata, 5, tlength);
        if (compressType >= 129 && tlength <= 1) {
            compressType -= 128;
            if (path != null) {
                let dir = pathLib.dirname(path);
                let fname = pathLib.basename(path, ".mca");
                let mccfname = function () {
                    let arr = fname.split(".");
                    if (arr.length >= 4) {
                        return `c.${parseInt(arr[1]) * 32 + regioninfo.x}.${parseInt(arr[2]) * 32 + regioninfo.z}.mcc`;
                    } else
                        return `c.${regioninfo.x}.${regioninfo.z}.mcc`;
                }();
                let mccpath = pathLib.join(dir, mccfname);
                if (fs.existsSync(mccpath)) {
                    tdata = fs.readFileSync(mccpath);
                    tdata = read_bytes_with_length(tdata, 5, tdata.length - 5);
                }
            } else {
                tdata = [];
            }
        }
        if (compressType == 1) {
            try {
                const decompressedData = zlib.gunzipSync(tdata);
                tdata = decompressedData;
            } catch (error) {
                throw new Error('Unzip error (GZip (RFC1952)): ', error);
            }
        } else if (compressType == 2) {
            try {
                const decompressedData = zlib.inflateSync(tdata);
                tdata = decompressedData;
            } catch (error) {
                throw new Error('Unzip error (Zlib (RFC1950)): ', error);
            }
        } else if (compressType == 3) {
            // 不压缩
        } else if (compressType == 4) {
            try {
                const decompressedData = lz4.decode(tdata);
                tdata = decompressedData;
            } catch (error) {
                throw new Error('Unzip error (LZ4): ', error);
            }
        } else {
            throw new Error(`Unsupport compress algorithm type ${compressType}!`);
        }
        return new NBTFILE_PARSER(tdata);
    }
    function __parse_header(data) {
        let dat = Buffer.from(data);
        let arr = new Array();
        if (dat.length < 8 * 1024) {
            throw new Error(`Region data has truncated header: ${dat.length}`);
        }
        for (let z = 0; z <= 31; z++) {
            for (let x = 0; x <= 31; x++) {
                let headeroffset = (z * 32 + x) * 4;


                let __num_1 = dat[headeroffset];
                let __num_2 = dat[headeroffset + 1];
                let __num_3 = dat[headeroffset + 2];
                let __length = dat[headeroffset + 3];
                let length = __length;
                let offset = __num_1 * 256 * 256 + __num_2 * 256 + __num_3;

                let timestampoffset = 4096 + headeroffset;
                let _num_1 = dat[timestampoffset];
                let _num_2 = dat[timestampoffset + 1];
                let _num_3 = dat[timestampoffset + 2];
                let _num_4 = dat[timestampoffset + 3];
                let timestamp = _num_1 * 256 * 256 * 256 + _num_2 * 256 * 256 + _num_3 * 256 + _num_4;

                if (length == 0 && offset == 0) continue; //未被创建
                if (offset < 2) {
                    console.warn(`Region data has invalid sector at index: (${x},${z}); sector ${offset} overlaps with header`);
                    continue;
                }
                if (offset == 0) {
                    console.warn(`Region data has invalid sector at index: (${x},${z}); sector ${offset} overlaps with header`);
                    continue;
                }
                arr.push(new MCA_HEADER(x, z, offset, length, null, timestamp));
            }
        }
        return arr;
    }
}

function MCAFILE_SAVER(headers) {
    this.headers = headers;
    if (this.headers == null) {
        this.headers = new Array();
    }
    this.get_raw_data = function (compressAlgorithm = 2) {
        return __save(this.headers, null, compressAlgorithm);
    }
    this.save_to_file = function (path, compressAlgorithm = 2) {
        fs.writeFileSync(path, __save(this.headers, path, compressAlgorithm));
    }
    function __save(headers, path = undefined, compressAlgorithm = 2) {
        function __compress(data, compressType = 2) {
            if (compressType == 1) {
                try {
                    const decompressedData = zlib.gzipSync(data);
                    return decompressedData;
                } catch (error) {
                    throw new Error('Unzip error (GZip (RFC1952)): ', error);
                }
            } else if (compressType == 2) {
                try {
                    const decompressedData = zlib.deflateSync(data);
                    return decompressedData;
                } catch (error) {
                    throw new Error('Unzip error (Zlib (RFC1950)): ', error);
                }
            } else if (compressType == 3) {
                // 不压缩
                return data;
            } else if (compressType == 4) {
                try {
                    const decompressedData = lz4.encode(data);
                    return decompressedData;
                } catch (error) {
                    throw new Error('Unzip error (LZ4): ', error);
                }
            } else {
                throw new Error(`Unsupport compress algorithm type ${compressType}!`);
            }
        }
        let BufferFlow = new NBTStream();
        let headerBuffer = Buffer.alloc(4096);
        let timestampBuffer = Buffer.alloc(4096);
        let offset_now = 2;
        headers.sort((a, b) => {
            if (a.z == b.z) {
                return a.x - b.x;
            } else {
                return a.z - b.z;
            }
        });
        for (let i = 0; i < headers.length; i++) {
            let headerOffset = (headers[i].z * 32 + headers[i].x) * 4;
            let dt = headers[i].data;
            // 4096+headerOffset
            if (headers[i].timestamp == null) headers[i].timestamp = Date.now();
            JavaBufferUtils.toInt(headers[i].timestamp).copy(timestampBuffer, headerOffset, 0, 4);
            dt = __compress(dt, compressAlgorithm);
            let tdt = Buffer.alloc(dt.length + 5);
            let num = dt.length;
            let __num_3 = num % 256;
            let __num_2 = num / 256;
            let __num_1 = __num_2 / 256;
            let __num_0 = __num_1 / 256;
            __num_2 = __num_2 % 256;
            __num_1 = __num_1 % 256;
            __num_0 = __num_0 % 256;
            tdt[0] = __num_0;
            tdt[1] = __num_1;
            tdt[2] = __num_2;
            tdt[3] = __num_3;
            tdt[4] = compressAlgorithm;
            dt.copy(tdt, 5, 0, dt.length);
            let dataTrueLen = tdt.length;
            let dataStoredLen = (parseInt(dataTrueLen / 4096));
            if (dataTrueLen % 4096 > 0) dataStoredLen += 1;
            if (dataStoredLen > 255) {
                if (path == null) {
                    throw new Error("Cannot save oversized chunk!")
                } else {
                    let dir = pathLib.dirname(path);
                    let fname = pathLib.basename(path, ".mca");
                    let mccfname = function () {
                        let arr = fname.split(".");
                        if (arr.length >= 4) {
                            return `c.${parseInt(arr[1]) * 32 + headers[i].x}.${parseInt(arr[2]) * 32 + headers[i].z}.mcc`;
                        } else
                            return `c.${headers[i].x}.${headers[i].z}.mcc`;
                    }();
                    let mccpath = pathLib.join(dir, mccfname);
                    let wdt = Buffer.alloc(dt.length + 5);
                    dt.copy(wdt, 5, 0, dt.length);
                    fs.writeFileSync(mccpath, wdt);
                    dataStoredLen = 1;
                    tdt = Buffer.from([0, 0, 0, 1, 128]);
                    tdt[4] = compressAlgorithm + 128;
                    console.warn(`Saving oversized chunk (${headers[i].x},${headers[i].z}) (${dataTrueLen} bytes} to external file ${mccpath}`);
                }
            }
            let wdt = Buffer.alloc(4096 * dataStoredLen);
            tdt.copy(wdt, 0, 0, tdt.length);
            BufferFlow.write(wdt);
            let _num_2 = offset_now % 256;
            let _num_1 = offset_now / 256;
            let _num_0 = _num_1 / 256;
            _num_1 = _num_1 % 256;
            _num_0 = _num_0 % 256;
            headerBuffer[headerOffset + 0] = _num_0;
            headerBuffer[headerOffset + 1] = _num_1;
            headerBuffer[headerOffset + 2] = _num_2;
            headerBuffer[headerOffset + 3] = dataStoredLen;
            offset_now += dataStoredLen;

        }
        BufferFlow.end();
        let bu = BufferFlow.getBuffer();
        let ret = Buffer.alloc(8192 + bu.length);
        headerBuffer.copy(ret, 0, 0, 4096);
        timestampBuffer.copy(ret, 4096, 0, 4096);
        bu.copy(ret, 8192, 0, bu.length);
        return ret;
    }
}
module.exports = { NBTFILE_PARSER, NBTFILE_SAVER, MCNBT, NBTFILE_SNBT_TOOL, MCAFILE_PARSER, MCA_HEADER, MCAFILE_SAVER }