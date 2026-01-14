

/**
 * 数值转Buffer（Java大端序格式）
 */
class JavaBufferUtils {
    /**
     * bit（实际对应Java byte类型，1字节，有符号）
     * @param {number} value -128 到 127
     * @returns {Buffer}
     */
    static toByte(value) {
        if (value < 0) {
            value = 256 + value;
        }
        const buf = Buffer.from([value]);
        return buf;
    }

    /**
     * short（2字节，有符号，大端序）
     * @param {number} value -32768 到 32767
     * @returns {Buffer}
     */
    static toShort(value) {
        if (value >= 32768) value = -65536 + value;
        const buf = Buffer.alloc(2);
        buf.writeInt16BE(value, 0);
        return buf;
    }

    /**
     * int（4字节，有符号，大端序）
     * @param {number} value -2147483648 到 2147483647
     * @returns {Buffer}
     */
    static toInt(value) {
        if (value >= 2147483648) value = -4294967296 + value;
        const buf = Buffer.alloc(4);
        buf.writeInt32BE(value, 0);
        return buf;
    }

    /**
     * long（8字节，有符号，大端序）
     * JavaScript中可使用BigInt表示64位整数
     * @param {bigint|number} value
     * @returns {Buffer}
     */
    static toLong(value) {
        const buf = Buffer.alloc(8);
        if (typeof value === 'bigint') {
            buf.writeBigInt64BE(value, 0);
        } else {
            // 转换为BigInt，确保正确处理64位
            buf.writeBigInt64BE(BigInt(Math.floor(value)), 0);
        }
        return buf;
    }

    /**
     * float（4字节，单精度浮点数，大端序）
     * @param {number} value
     * @returns {Buffer}
     */
    static toFloat(value) {
        const buf = Buffer.alloc(4);
        buf.writeFloatBE(value, 0);
        return buf;
    }

    /**
     * double（8字节，双精度浮点数，大端序）
     * @param {number} value
     * @returns {Buffer}
     */
    static toDouble(value) {
        const buf = Buffer.alloc(8);
        buf.writeDoubleBE(value, 0);
        return buf;
    }

    /**
     * ============ Buffer转数值 ============
     */

    /**
     * 从Buffer读取byte（有符号1字节）
     * @param {Buffer} buffer 
     * @param {number} offset 偏移量，默认0
     * @returns {number}
     */
    static fromByte(buffer, offset = 0) {
        return buffer.readInt8(offset);
    }

    /**
     * 从Buffer读取short（有符号2字节，大端序）
     * @param {Buffer} buffer 
     * @param {number} offset 偏移量
     * @returns {number}
     */
    static fromShort(buffer, offset = 0) {
        return buffer.readInt16BE(offset);
    }

    /**
     * 从Buffer读取int（有符号4字节，大端序）
     * @param {Buffer} buffer 
     * @param {number} offset 偏移量
     * @returns {number}
     */
    static fromInt(buffer, offset = 0) {
        return buffer.readInt32BE(offset);
    }

    /**
     * 从Buffer读取long（有符号8字节，大端序）
     * @param {Buffer} buffer 
     * @param {number} offset 偏移量
     * @returns {bigint}
     */
    static fromLong(buffer, offset = 0) {
        return buffer.readBigInt64BE(offset);
    }

    /**
     * 从Buffer读取float（单精度浮点数，大端序）
     * @param {Buffer} buffer 
     * @param {number} offset 偏移量
     * @returns {number}
     */
    static fromFloat(buffer, offset = 0) {
        return buffer.readFloatBE(offset);
    }

    /**
     * 从Buffer读取double（双精度浮点数，大端序）
     * @param {Buffer} buffer 
     * @param {number} offset 偏移量
     * @returns {number}
     */
    static fromDouble(buffer, offset = 0) {
        return buffer.readDoubleBE(offset);
    }
    /**
     * 通用方法：根据类型转换为Buffer
     * @param {number|bigint} value
     * @param {string} type 'byte'|'short'|'int'|'long'|'float'|'double'
     * @returns {Buffer}
     */
    static toBuffer(value, type) {
        switch (type.toLowerCase()) {
            case 'byte':
            case 'bit': // bit通常指代byte
                return this.toByte(value);
            case 'short':
                return this.toShort(value);
            case 'int':
                return this.toInt(value);
            case 'long':
                return this.toLong(value);
            case 'float':
                return this.toFloat(value);
            case 'double':
                return this.toDouble(value);
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }
    /**
        * 通用方法：从Buffer读取数值
        * @param {Buffer} buffer 
        * @param {string} type 'byte'|'short'|'int'|'long'|'float'|'double'
        * @param {number} offset 偏移量
        * @returns {number|bigint}
        */
    static fromBuffer(buffer, type, offset = 0) {
        switch (type.toLowerCase()) {
            case 'byte':
            case 'bit':
                return this.fromByte(buffer, offset);
            case 'short':
                return this.fromShort(buffer, offset);
            case 'int':
                return this.fromInt(buffer, offset);
            case 'long':
                return this.fromLong(buffer, offset);
            case 'float':
                return this.fromFloat(buffer, offset);
            case 'double':
                return this.fromDouble(buffer, offset);
            case 'string':
                return buffer.toString();
            default:
                throw new Error(`不支持的读取类型: ${type}`);
        }
    }
    /**
     * 批量转换：将多个数值转换为连续Buffer
     * @param {Array} values 数值数组
     * @param {string} type 类型
     * @returns {Buffer}
     */
    static toBufferArray(values, type) {
        const buffers = values.map(v => this.toBuffer(v, type));
        return Buffer.concat(buffers);
    }
}
module.exports = { JavaBufferUtils }
