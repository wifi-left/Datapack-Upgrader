const { Writable } = require('stream');

class NBTStream extends Writable {
    constructor() {
        super();
        this.chunks = [];
    }

    _write(chunk, encoding, callback) {
        // 确保chunk是Buffer类型
        if (!Buffer.isBuffer(chunk)) {
            // 如果是数字，转换为Buffer
            if (typeof chunk === 'number') {
                chunk = Buffer.from([chunk]);
            } 
            // 如果是字符串，根据encoding转换为Buffer
            else if (typeof chunk === 'string') {
                chunk = Buffer.from(chunk, encoding || 'utf8');
            }
            // 其他类型尝试转换
            else {
                try {
                    chunk = Buffer.from(chunk);
                } catch (err) {
                    callback(err);
                    return;
                }
            }
        }
        
        this.chunks.push(chunk);
        callback();
    }

    getBuffer() {
        return Buffer.concat(this.chunks);
    }
}

module.exports = { NBTStream };