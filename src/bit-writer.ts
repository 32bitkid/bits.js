import { ArrayBufferResizer, resizeNotSupported } from "./resizers";

export interface BitWriter {
    readonly byteLength: number;

    write(val: number, width: number): BitWriter;

    on(): BitWriter;
    off(): BitWriter;
    write1(...values: (boolean|0|1)[]): BitWriter;
    write2(...values: (0|1|2|3)[]): BitWriter;
    write3(...values: (0|1|2|3|4|5|6|7)[]): BitWriter;
    write4(...values: number[]): BitWriter;
    write6(...values: number[]): BitWriter;
    write8(...values: number[]): BitWriter;
    write16(...values: number[]): BitWriter;
    write24(...values: number[]): BitWriter;
    write32(...values: number[]): BitWriter;

    skip(width: number): BitWriter;
    byteAlign(): number;
    isAligned(): boolean;

    copyTo(dst: ArrayBuffer, start: number): void;
}

interface ArrayBufferBitReaderOptions {
    buffer?: ArrayBuffer;
    onResize?: ArrayBufferResizer;
}

class ArrayBufferBitWriter implements BitWriter {
    private readonly _resize: ArrayBufferResizer;

    private _buffer: ArrayBuffer;
    private _bytes: Uint8Array;
    private _idx: number;
    private _bit: number;

    public get buffer(): ArrayBuffer { return this._buffer; }
    public get byteLength(): number  { return this._idx + (this._bit === 0 ? 0 : 1) }

    public constructor(options: ArrayBufferBitReaderOptions = {}) {
        const {
            onResize = resizeNotSupported,
            buffer = onResize(),
        } = options;

        this._buffer = buffer;
        this._bytes = new Uint8Array(buffer);
        this._resize = onResize;
        this._idx = 0;
        this._bit = 0;
    }

    public skip(width: number): this {
        this._bit += width;
        this._idx += this._bit >>> 3;
        this._bit &= 0x7;
        return this;
    }

    public write(value: number, valueWidth: number): this {
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

    public on(): this { return this.write(1, 1); }
    public off(): this { return this.write(0, 1); }

    public write1(...values: (boolean|0|1)[]): this {
        values.forEach((val): void => { this.write(val ? 1 : 0, 1) });
        return this;
    }
    public write2(...values: (0|1|2|3)[]): this {
        values.forEach((val): void => { this.write(val, 2) });
        return this;
    }
    public write3(...values: (0|1|2|3|4|5|6|7)[]): this {
        values.forEach((val): void => { this.write(val, 3) });
        return this;
    }
    public write4(...values: number[]): this {
        values.forEach((val): void => { this.write(val, 4) });
        return this;
    }
    public write6(...values: number[]): this {
        values.forEach((val): void => { this.write(val, 6) });
        return this;
    }
    public write8(...values: number[]): this {
        values.forEach((val): void => { this.write(val, 8) });
        return this;
    }
    public write16(...values: number[]): this {
        values.forEach((val): void => { this.write(val, 16) });
        return this;
    }
    public write24(...values: number[]): this {
        values.forEach((val): void => { this.write(val, 24) });
        return this;
    }
    public write32(...values: number[]): this {
        values.forEach((val): void => { this.write(val, 32) });
        return this;
    }

    public byteAlign(): number {
        const skipped = this._bit;
        if (skipped) {
            this._bit = 0;
            this._idx += 1;
        }
        return skipped;
    }

    public isAligned(): boolean {
        return this._bit === 0;
    }

    public copyTo(dst: ArrayBuffer, start: number): void {
        if (dst.byteLength + start < this.byteLength)  {
            throw new Error('not enough space: destination ArrayBuffer cannot hold the entire array');
        }

        const srcBytes = new Uint8Array(this.buffer, start);
        const dstBytes = new Uint8Array(dst);
        dstBytes.set(srcBytes);
    }
}

export default ArrayBufferBitWriter;
