const { EventEmitter } = require('events');

/**
 * 内存高效的动态NBT流处理类
 * 采用分块缓冲和流式处理，避免一次性分配大内存
 */
class NBTStream extends EventEmitter {
    /**
     * 创建NBT流实例
     * @param {Object} options - 配置选项
     * @param {number} options.chunkSize - 每个缓冲块的大小（默认64KB）
     * @param {number} options.maxChunks - 最大缓冲块数量（默认256，约16MB）
     */
    constructor(options = {}) {
        super();
        
        this.chunkSize = options.chunkSize || 64 * 1024; // 64KB 每块
        this.maxChunks = options.maxChunks || 256; // 最多256块，约16MB内存
        
        this.chunks = []; // 缓冲块数组
        this.currentChunk = null; // 当前活跃缓冲块
        this.currentOffset = 0; // 在当前块中的偏移量
        
        this.totalBytes = 0; // 总字节数
        this.isEnded = false; // 是否已结束
        
        this.allocateNewChunk();
    }
    
    /**
     * 分配新的缓冲块
     * @private
     */
    allocateNewChunk() {
        if (this.chunks.length >= this.maxChunks) {
            throw new Error(`超出最大缓冲限制: ${this.maxChunks} 个块 (约${Math.round(this.maxChunks * this.chunkSize / 1024 / 1024)}MB)`);
        }
        
        this.currentChunk = Buffer.allocUnsafe(this.chunkSize);
        this.chunks.push(this.currentChunk);
        this.currentOffset = 0;
    }
    
    /**
     * 写入数据到流
     * @param {Buffer|Uint8Array|string} data - 要写入的数据
     * @returns {number} 写入的字节数
     */
    write(data) {
        if (this.isEnded) {
            throw new Error('流已结束，无法继续写入');
        }
        
        let sourceBuffer;
        
        // 处理不同类型的数据
        if (Buffer.isBuffer(data)) {
            sourceBuffer = data;
        } else if (data instanceof Uint8Array) {
            sourceBuffer = Buffer.from(data);
        } else if (typeof data === 'string') {
            sourceBuffer = Buffer.from(data, 'utf8');
        } else if (typeof data === 'number') {
            // 写入单个字节
            sourceBuffer = Buffer.from([data & 0xFF]);
        } else {
            throw new TypeError('不支持的数据类型，请使用Buffer、Uint8Array或string');
        }
        
        const dataLength = sourceBuffer.length;
        let dataOffset = 0;
        
        // 分段写入，处理跨块情况
        while (dataOffset < dataLength) {
            const remainingInChunk = this.chunkSize - this.currentOffset;
            const remainingData = dataLength - dataOffset;
            const writeSize = Math.min(remainingInChunk, remainingData);
            
            // 如果当前块没有足够空间，分配新块
            if (remainingInChunk === 0) {
                this.allocateNewChunk();
                continue;
            }
            
            // 复制数据到当前块
            sourceBuffer.copy(this.currentChunk, this.currentOffset, dataOffset, dataOffset + writeSize);
            
            this.currentOffset += writeSize;
            dataOffset += writeSize;
            this.totalBytes += writeSize;
        }
        
        this.emit('write', dataLength);
        return dataLength;
    }
    
    /**
     * 写入大整数（64位）
     * @param {bigint} value - 64位整数
     */
    writeInt64(value) {
        // 处理有符号64位整数
        const buffer = Buffer.alloc(8);
        
        // 使用BigInt进行计算
        const bigValue = BigInt(value);
        
        // 写入低32位
        buffer.writeUInt32LE(Number(bigValue & 0xFFFFFFFFn), 0);
        // 写入高32位
        buffer.writeUInt32LE(Number((bigValue >> 32n) & 0xFFFFFFFFn), 4);
        
        this.write(buffer);
    }
    
    /**
     * 写入双精度浮点数
     * @param {number} value - 双精度浮点数
     */
    writeDouble(value) {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(value, 0);
        this.write(buffer);
    }
    
    /**
     * 写入单精度浮点数
     * @param {number} value - 单精度浮点数
     */
    writeFloat(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value, 0);
        this.write(buffer);
    }
    
    /**
     * 写入带长度前缀的字符串
     * @param {string} str - 要写入的字符串
     * @param {string} encoding - 编码方式，默认为'utf8'
     */
    writeStringWithLength(str, encoding = 'utf8') {
        const strBuffer = Buffer.from(str, encoding);
        this.writeUInt16(strBuffer.length); // 写入长度前缀（2字节）
        this.write(strBuffer);
    }
    
    /**
     * 写入16位无符号整数（小端序）
     * @param {number} value - 16位整数
     */
    writeUInt16(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(value, 0);
        this.write(buffer);
    }
    
    /**
     * 写入32位无符号整数（小端序）
     * @param {number} value - 32位整数
     */
    writeUInt32(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(value, 0);
        this.write(buffer);
    }
    
    /**
     * 结束流，整理内存
     */
    end() {
        if (this.isEnded) return;
        
        this.isEnded = true;
        
        // 如果最后一个块没有被完全使用，创建精确大小的缓冲区
        if (this.currentOffset < this.chunkSize && this.currentOffset > 0) {
            const lastChunk = this.chunks[this.chunks.length - 1];
            this.chunks[this.chunks.length - 1] = lastChunk.slice(0, this.currentOffset);
        }
        
        this.emit('end', this.totalBytes);
    }
    
    /**
     * 获取合并后的缓冲区
     * @returns {Buffer} 包含所有数据的缓冲区
     */
    getBuffer() {
        if (!this.isEnded) {
            throw new Error('请先调用end()方法结束流');
        }
        
        if (this.chunks.length === 0) {
            return Buffer.alloc(0);
        }
        
        // 如果只有一个块，直接返回该块（避免复制）
        if (this.chunks.length === 1) {
            return this.chunks[0];
        }
        
        // 多个块时使用Buffer.concat合并
        return Buffer.concat(this.chunks, this.totalBytes);
    }
    
    /**
     * 获取总字节数
     * @returns {number} 总字节数
     */
    getSize() {
        return this.totalBytes;
    }
    
    /**
     * 获取已使用的内存块数量
     * @returns {number} 内存块数量
     */
    getChunkCount() {
        return this.chunks.length;
    }
    
    /**
     * 清空流，重置状态
     */
    clear() {
        this.chunks = [];
        this.currentChunk = null;
        this.currentOffset = 0;
        this.totalBytes = 0;
        this.isEnded = false;
        this.allocateNewChunk();
        this.emit('clear');
    }
    
    /**
     * 流式获取数据（适用于大数据量）
     * @param {number} chunkSize - 每次返回的数据块大小
     * @returns {IterableIterator<Buffer>} 数据块迭代器
     */
    *stream(chunkSize = 64 * 1024) {
        if (!this.isEnded) {
            throw new Error('请先调用end()方法结束流');
        }
        
        // 如果只有一块，直接返回
        if (this.chunks.length === 1) {
            yield this.chunks[0];
            return;
        }
        
        // 生成器函数，流式返回数据
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            
            // 如果指定了块大小，且当前块较大，则进行分片
            if (chunkSize < this.chunkSize && chunk.length > chunkSize) {
                let offset = 0;
                while (offset < chunk.length) {
                    const end = Math.min(offset + chunkSize, chunk.length);
                    yield chunk.slice(offset, end);
                    offset = end;
                }
            } else {
                yield chunk;
            }
        }
    }
    
    /**
     * 将流数据写入文件（流式写入，适合大文件）
     * @param {string} filePath - 文件路径
     * @param {Object} options - 写入选项
     * @returns {Promise<void>}
     */
    async writeToFile(filePath, options = {}) {
        const fs = require('fs').promises;
        
        if (!this.isEnded) {
            throw new Error('请先调用end()方法结束流');
        }
        
        // 如果数据量不大，直接写入
        if (this.chunks.length === 1) {
            await fs.writeFile(filePath, this.chunks[0]);
            return;
        }
        
        // 使用流式写入处理大数据
        const writeStream = require('fs').createWriteStream(filePath);
        
        return new Promise((resolve, reject) => {
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            
            for (const chunk of this.stream()) {
                if (!writeStream.write(chunk)) {
                    // 如果内部缓冲区已满，暂停并等待 drain 事件
                    writeStream.once('drain', () => {
                        const nextChunk = this.stream().next();
                        if (!nextChunk.done) {
                            writeStream.write(nextChunk.value);
                        }
                    });
                }
            }
            
            writeStream.end();
        });
    }
    
    /**
     * 释放内存，清理所有缓冲块
     */
    destroy() {
        this.chunks = [];
        this.currentChunk = null;
        this.currentOffset = 0;
        this.totalBytes = 0;
        this.isEnded = true;
        this.emit('destroy');
        this.removeAllListeners();
    }
}

// 导出类
module.exports = NBTStream;