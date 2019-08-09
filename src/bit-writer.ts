export interface IBitWriter {
    readonly buffer: ArrayBuffer
    readonly length: number

    write(val: number, width: number): IBitWriter

    on(): IBitWriter
    off(): IBitWriter
    write1(...values: (boolean|0|1)[]): IBitWriter
    write2(...values: (0|1|2|3)[]): IBitWriter
    write3(...values: (0|1|2|3|4|5|6|7)[]): IBitWriter
    write4(...values: number[]): IBitWriter
    write6(...values: number[]): IBitWriter
    write8(...values: number[]): IBitWriter
    write16(...values: number[]): IBitWriter
    write24(...values: number[]): IBitWriter
    write32(...values: number[]): IBitWriter

    skip(width: number): IBitWriter
    align(): number
}

type ArrayBufferResizer = (buffer?: ArrayBuffer) => ArrayBuffer

interface BitWriterOpts {
    buffer?: ArrayBuffer
    start?: number
    onResize?: ArrayBufferResizer
}

class BitWriter implements IBitWriter {
    private readonly _resize: ArrayBufferResizer;

    private _buffer: ArrayBuffer;
    private _bytes: Uint8Array;
    private _idx: number;
    private _bit: number;

    get buffer(): ArrayBuffer { return this._buffer; }
    get length():number  { return this._idx + (this._bit === 0 ? 0 : 1) }

    constructor(options: BitWriterOpts = {}) {
        const {
            onResize = resizeNotSupported,
            buffer = onResize(),
            start = 0,
        } = options;

        this._buffer = buffer;
        this._bytes = new Uint8Array(buffer);
        this._idx = start;
        this._resize = onResize;
        this._bit = 0;
    }

    skip(width: number): IBitWriter {
        this._bit += width;
        this._idx += this._bit >>> 3;
        this._bit &= 0x7;
        return this;
    }

    write(value: number, valueWidth: number): IBitWriter {
        let remainder = valueWidth;
        let payload = value << (32 - valueWidth);

        while (remainder > 0) {
            if (this._idx >= this._bytes.length) {
                this._buffer = this._resize(this._buffer);
                this._bytes = new Uint8Array(this._buffer);
                if (this._idx >= this._bytes.length) {
                    throw new Error('overflow: out of buffer space');
                }
            }

            const availableBits = 8 - this._bit;
            const width = Math.min(remainder, availableBits);
            const shift = (availableBits - width);
            const bits = payload >>> (32 - width - shift);
            const mask = ~(-1 >>> (32 - width - shift));

            this._bytes[this._idx] &= mask;
            this._bytes[this._idx] |= bits;

            this.skip(width);
            payload <<= width;
            remainder -= width;
        }

        return this;
    }

    on(): IBitWriter { return this.write(1, 1); }
    off(): IBitWriter { return this.write(0, 1); }

    write1(...values: (boolean|0|1)[]): IBitWriter {
        return values.reduce((w: IBitWriter, val) => w.write(val ? 1 : 0, 1), this);
    }
    write2(...values: (0|1|2|3)[]): IBitWriter {
        return values.reduce<IBitWriter>((w, val) => w.write(val, 2), this);
    }
    write3(...values: (0|1|2|3|4|5|6|7)[]): IBitWriter {
        return values.reduce<IBitWriter>((w, val) => w.write(val, 3), this);
    }
    write4(...values: number[]): IBitWriter { return values.reduce<IBitWriter>((w, val) => w.write(val, 4), this); }
    write6(...values: number[]): IBitWriter { return values.reduce<IBitWriter>((w, val) => w.write(val, 6), this); }
    write8(...values: number[]): IBitWriter { return values.reduce<IBitWriter>((w, val) => w.write(val, 8), this); }
    write16(...values: number[]): IBitWriter { return values.reduce<IBitWriter>((w, val) => w.write(val, 16), this); }
    write24(...values: number[]): IBitWriter { return values.reduce<IBitWriter>((w, val) => w.write(val, 24), this); }
    write32(...values: number[]): IBitWriter { return values.reduce<IBitWriter>((w, val) => w.write(val, 32), this); }

    align(): number {
        const skipped = this._bit;
        if (skipped) {
            this._bit = 0;
            this._idx += 1;
        }
        return skipped;
    }
}

export function createChunkAllocator(chunkSize: number = 0x10000): ArrayBufferResizer {
    return function onResize(src?: ArrayBuffer): ArrayBuffer {
        if (src === undefined) { return new ArrayBuffer(chunkSize); }
        const dst = new ArrayBuffer(src.byteLength + chunkSize);
        new Uint8Array(dst).set(new Uint8Array(src), 0);
        return dst;
    }
}

export function createResizer(initialSize: number = 0x10000): ArrayBufferResizer {
    return function onResize(src?: ArrayBuffer): ArrayBuffer {
        if (src === undefined) { return new ArrayBuffer(initialSize); }
        const dst = new ArrayBuffer(src.byteLength * 2 || 1);
        new Uint8Array(dst).set(new Uint8Array(src), 0);
        return dst;
    }
}

function resizeNotSupported(buffer?: ArrayBuffer): ArrayBuffer {
    throw new Error(buffer === undefined ? 'buffer is required' : 'overflow: out of buffer space');
}

export default BitWriter;
