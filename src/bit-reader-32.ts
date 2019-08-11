import BitReader from './bit-reader';

class BitReader32 implements BitReader {
    private readonly source: Uint8Array;
    private buffer: number = 0;
    private available: number = 0;

    private idx = 0;

    public constructor(source: ArrayBuffer) {
        this.source = new Uint8Array(source);
    }

    public skip(len: number): void {
        if (len <= 0) { throw new Error('out of range. 0<=len<=∞ '); }

        let rest = len;

        // Empty current buffer
        {
            const tLen = Math.min(this.available, len);
            this.buffer = tLen === 32 ? 0 : (this.buffer << tLen) >>> 0;
            this.available -= tLen;
            rest -= tLen;
        }

        // Trash full bytes
        {
            const trashBytes = rest >>> 3;
            if (this.idx + trashBytes > this.source.length) {
                throw new Error('unexpected end of stream');
            }
            this.idx += trashBytes;
            rest -= trashBytes << 3;
        }

        // Trash remaining bits
        if (rest > 0) {
            this._fill(rest);
            this.buffer = (this.buffer << rest) >>> 0;
            this.available -= rest;
        }
    }

    public peek(len: number): number {
        switch (true) {
            case len > 0 && len <= 24:
            case len > 0 && len <= 32 && this.available === 0:
            case len > 0 && len <= 32 && this.available === 32: {
                if (this.available < len) {
                    this._fill(len);
                }
                const shift = (32 - len);
                return (this.buffer >>> shift & (~0 >>> shift)) >>> 0;
            }
            case len > 0 && len <= 32 && len <= (this.available | 0b11000): {
                if (this.available < len) {
                    this._fill((32 - len) & 0b11000);
                }
                const shift = (32 - len);
                return (this.buffer >>> shift & (~0 >>> shift)) >>> 0;
            }
            case len > 0 && len <= 32:
                throw new Error(`unaligned peek: only ${this.available} bits available of the requested ${len}`)
        }

        throw new Error(`${len} is out of range: (0<len<=32)`)
    }

    public take(len: number): number {
        switch (true) {
            case len > 0 && len <= 24:
            case len > 0 && len <= 32 && this.available === 0:
            case len > 0 && len <= 32 && this.available === 32:
                return this._take(len);
            case len > 0 && len <= 32: {
                const hiLen = this.available;
                const lowLen = len - hiLen;

                const hiBits = this.buffer >>> (32 - hiLen - lowLen);
                this.buffer = this.available = 0; // reset

                const loBits = this._take(lowLen);
                return (hiBits | loBits) >>> 0;
            }
        }

        throw new Error(`${len} is out of range. (0<len<=32)`);
    }

    public isAligned(): boolean {
        return this.available % 8 === 0;
    }

    public byteAlign(): number {
        const bits = this.available % 8;
        if (bits > 0) { this.skip(bits); }
        return bits;
    }

    private _take(len: number): number {
        const val = this.peek(len);
        this.buffer = len === 32 ? 0 : (this.buffer << len) >>> 0;
        this.available -= len;
        return val;
    }

    private _fill(len: number): void {
        if (this.available + len > 32) { throw new Error('invalid fill: cannot fill more than 32 bits at a time'); }

        while (this.available <= 24) {
            if (this.idx + 1 > this.source.length) {
                if (this.available >= len) { break; }
                throw new Error('unexpected end of stream');
            }

            const shift = (32 - this.available - 8);
            const byte = this.source[this.idx++];
            this.buffer = this.buffer | (byte << shift);
            this.available += 8;
        }

        this.buffer = this.buffer >>> 0;
    }
}

export default BitReader32
