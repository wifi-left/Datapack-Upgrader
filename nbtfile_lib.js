const fs = require("fs");
const pathLib = require("path");
const zlib = require("zlib");
const Stream = require('stream');
const { NBTStream } = require("./nbtstream.js");
const { JavaBufferUtils } = require("./java_buffer_utils.js");

const NBTFILE_SNBT_TOOL = {
    FromMCNBT: function (data) {
        function __pack(data) {
            let root = {};
            function parse_main(dat) {
                let t = dat.getType();
                return parse_body(dat, t);
            }
            function parse_body(dat, t) {
                if (t == 'component') {
                    return parse_component(dat);
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
            function parse_component(dat) {
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
            root = parse_component(data);
            return root;
        }
        return __pack(data);
    },
    ToMCNBT: function (data) {

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

                // 不允许直接修改type
                if (prop === '_type' || prop === 'type') {
                    console.warn('Type cannot be modified directly. Use setType() method.');
                    return false;
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

function NBTFILE_PARSER() {
    this.file_stream = null;
    this.content = null;
    this.load_from_raw_data = function (data) {
        this.content = data;
    }
    this.load_from_gzip_data = function (data) {
        this.content = data;
        try {
            const compressedData = Buffer.from(this.content); // gzip压缩数据
            const decompressedData = zlib.gunzipSync(compressedData);
            this.content = decompressedData;
        } catch (error) {
            throw new Error('解压失败: ', error);
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
                    //component
                    val = read_component();
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
        function read_component() {
            let __map = {};
            while (i < data.length) {
                let type = read_type();
                // console.log(type,name.toString())
                if (type == 0) {
                    let __res = new MCNBT("component", __map);
                    return __res;
                } else {
                    let name = read_tagname();
                    let val = read_specific_data(type);
                    __map[name] = val;
                }
            }
            throw new Error(`Incomplete components. Are these data really in the NBT format of Minecraft? (out of array)`);
        }
        let type = read_type();
        let name = read_tagname();
        if (type == 10) return read_component();
        else throw new Error(`Unknown data type '${type}' ! Are these data really in the NBT format of Minecraft? (unknown type)`);

    }
}

function NBTFILE_SAVER() {
    this.raw_data = null;
    this.fromBuffer = function (data) {
        this.raw_data = data;
    }
    this.fromMCNBT = function (data) {
        this.raw_data = __pack(data);
    }
    this.save_with_gzip = function (path) {
        let _val = this.get_gzip_raw();
        fs.writeFileSync(path, _val);
    }
    this.save_nogzip = function (path) {
        let _val = this.get_raw();
        fs.writeFileSync(path, _val);
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
            case 'component':
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
            parse_body(dat, t);
        }
        function parse_body(dat, t) {
            if (t == 'component') {
                parse_component(dat);
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
        function parse_component(dat) {
            let __map = dat.getValue();
            for (let key in __map) {
                let ele = __map[key];
                parse_main(ele, key);
            }
        }
        bufs.write(Buffer.from([10, 0, 0]));
        parse_component(data)
        bufs.write(Buffer.from([0]));
        bufs.end();
        return bufs.getBuffer();
    }
}
module.exports = { NBTFILE_PARSER, NBTFILE_SAVER, MCNBT,NBTFILE_SNBT_TOOL }