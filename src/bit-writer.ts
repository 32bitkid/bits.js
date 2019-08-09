interface IBitWriter {
    readonly buffer: ArrayBuffer
    readonly position: number

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

class BitWriter implements IBitWriter {
    private readonly bytes: Uint8Array;
    private readonly length: number;

    private idx: number;
    private bit: number;

    get buffer(): ArrayBuffer { return this.bytes.buffer; }
    get position():number  { return this.idx + (this.bit === 0 ? 0 : 1) }

    constructor(buffer: ArrayBuffer, start = 0, length = buffer.byteLength - start) {
        this.bytes = new Uint8Array(buffer);
        this.idx = start;
        this.length = length;
        this.bit = 0;
    }

    skip(width: number): IBitWriter {
        this.bit += width;
        this.idx += this.bit >>> 3;
        this.bit &= 0x7;
        return this;
    }

    write(value: number, valueWidth: number): IBitWriter {
        let remainder = valueWidth;
        let payload = value << (32 - valueWidth);

        while (remainder > 0) {
            if (this.idx >= this.length) {
                throw new Error('out of buffer space');
            }

            const availableBits = 8 - this.bit;
            const width = Math.min(remainder, availableBits);
            const shift = (availableBits - width);
            const bits = payload >>> (32 - width - shift);
            const mask = ~(-1 >>> (32 - width - shift));

            this.bytes[this.idx] &= mask;
            this.bytes[this.idx] |= bits;

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
        const skipped = this.bit;
        if (skipped) {
            this.bit = 0;
            this.idx += 1;
        }
        return skipped;
    }
}

export default BitWriter;
