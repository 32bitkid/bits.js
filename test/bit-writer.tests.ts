import { expect } from 'chai';

import BitWriter, {createChunkAllocator, createResizer} from '../src/bit-writer';

describe('BitWriter', () =>{
    describe('with fixed buffer', () => {
        it('should write some simple bits', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({ buffer });
            writer.write1(true)
                .write1(true)
                .write1(true)
                .write1(true)
                .write1(true)
                .write1(true)
                .write1(true)
                .write1(true)

                .write1(true)
                .write1(false)
                .write1(true)
                .write1(false)
                .off().on().off().on();

            expect(writer.length).equal(2);

            const bytes = new Uint8Array(buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xff,0xA5))
        });

        it('should write one bit at a time', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({ buffer });
            writer.write1(true);

            expect(writer.length).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0b1000_0000,0x00))
        });

        it('should write a uint8', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({ buffer });
            writer.write(0xA5, 8);

            expect(writer.length).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xA5,0x00))
        });

        it('should write a uint16', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({ buffer });
            writer.write(0x1234, 16);

            expect(writer.length).equal(2)

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12,0x34))
        });

        it('should write a uint32', () => {
            const buffer = new ArrayBuffer(4);
            const writer = new BitWriter({ buffer });
            writer.write(0x12345678, 32);

            expect(writer.length).equal(4)

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12,0x34,0x56,0x78))
        });

        it('should write a unaligned byte', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({ buffer });
            writer.write(0x5, 4);
            expect(writer.length).equal(1);
            writer.write(0x5A, 8);
            expect(writer.length).equal(2);
            writer.write(0xA, 4);
            expect(writer.length).equal(2);


            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x55, 0xAA))
        });

        it('should respect start length', () => {
            const buffer = new ArrayBuffer(16);
            const writer = new BitWriter({ buffer, start: 4 });
            writer.write(0xFF, 8);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(
                Uint8Array.of(
                    0,0,0,0,
                    0xff,0,0,0,
                    0,0,0,0,
                    0,0,0,0
                ),
            );
        });
    });

    describe('with a resizing buffer', () => {
        it('should resize using the default 2x strategy', () => {
            const writer = new BitWriter({ onResize: createResizer(0) });

            expect(writer.buffer.byteLength).to.equal(0);
            writer.write8(0x12);
            expect(writer.buffer.byteLength).to.equal(1);
            writer.write8(0x34);
            expect(writer.buffer.byteLength).to.equal(2);
            writer.write8(0x56);
            expect(writer.buffer.byteLength).to.equal(4);
            writer.write8(0x78);
            expect(writer.buffer.byteLength).to.equal(4);
            writer.write8(0x9a);
            expect(writer.buffer.byteLength).to.equal(8);

            const actual = new Uint8Array(writer.buffer, 0, writer.length);
            expect(actual).to.deep.equal(
                Uint8Array.of(0x12,0x34,0x56,0x78,0x9a),
            );
        });

        it('should resize using the default chunk strategy', () => {
            const writer = new BitWriter({ onResize: createChunkAllocator(8) });

            expect(writer.buffer.byteLength).to.equal(8);
            writer.write32(0x01234567);
            expect(writer.buffer.byteLength).to.equal(8);
            writer.write32(0x01234567);
            expect(writer.buffer.byteLength).to.equal(8);
            writer.write32(0x01234567);
            expect(writer.buffer.byteLength).to.equal(16);
            writer.write32(0x01234567);
            expect(writer.buffer.byteLength).to.equal(16);
            writer.write32(0x01234567);
            expect(writer.buffer.byteLength).to.equal(24);
            const actual = new Uint8Array(writer.buffer, 0, writer.length);
            expect(actual).to.deep.equal(
                Uint8Array.of(
                    0x01,0x23,0x45,0x67,
                    0x01,0x23,0x45,0x67,
                    0x01,0x23,0x45,0x67,
                    0x01,0x23,0x45,0x67,
                    0x01,0x23,0x45,0x67,
                ),
            );
        });
    });
});