import { expect } from 'chai';

import BitWriter from '../src/bit-writer-array-buffer';
import {createChunkAllocator, createResizer} from '../src/resizers';

describe('BitWriter', () =>{
    describe('with fixed buffer', () => {
        it('should write some simple bits', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write1(true)
                .write1(true)
                .write1(true)
                .write1(true)
                .write1(true, true, true, true)

                .write1(true, false)
                .write1(true, false)
                .off().on().off().on();

            expect(writer.byteLength).equal(2);

            const bytes = new Uint8Array(buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xff, 0xA5))
        });

        it('should write one bit at a time', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write1(true);

            expect(writer.byteLength).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0b1000_0000, 0x00))
        });

        it('should write a uint8', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write(0xA5, 8);

            expect(writer.byteLength).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xA5, 0x00))
        });

        it('should write a uint16', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write(0x1234, 16);

            expect(writer.byteLength).equal(2);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12, 0x34))
        });

        it('should write a uint16', () => {
            const buffer = new ArrayBuffer(3);
            const writer = new BitWriter({buffer});
            writer.write24(0x123456);

            expect(writer.byteLength).equal(3);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12, 0x34, 0x56))
        });

        it('should write a uint32', () => {
            const buffer = new ArrayBuffer(4);
            const writer = new BitWriter({buffer});
            writer.write(0x12345678, 32);

            expect(writer.byteLength).equal(4);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12, 0x34, 0x56, 0x78))
        });

        it('should write a unaligned byte', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write(0x5, 4);
            expect(writer.byteLength).equal(1);
            writer.write(0x5A, 8);
            expect(writer.byteLength).equal(2);
            writer.write(0xA, 4);
            expect(writer.byteLength).equal(2);


            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x55, 0xAA))
        });
    });

    describe('exotic writer helpers', () => {
        it('should write 2-bits at a time', () => {
            const buffer = new ArrayBuffer(1);
            const writer = new BitWriter({ buffer });
            writer.write2(0x3, 0x0, 0x3);
            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0b11001100))
        });

        it('should write 3-bits at a time', () => {
            const buffer = new ArrayBuffer(3);
            const writer = new BitWriter({ buffer });
            writer.write3(0,1,2,3,4,5,6,7);
            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(
                0b000_001_01,
                0b0_011_100_1,
                0b01_110_111,
            ))
        });

        it('should write 4-bits at a time', () => {
            const buffer = new ArrayBuffer(3);
            const writer = new BitWriter({ buffer });
            writer.write4(0, 3, 6, 9, 0xc, 0xf);
            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(
                0x03,
                0x69,
                0xcf,
            ))
        });

        it('should write 6-bits at a time', () => {
            const buffer = new ArrayBuffer(3);
            const writer = new BitWriter({ buffer });
            writer.write6(0, 15, 31, 63);
            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(
                0b000000_00,
                0b1111_0111,
                0b11_111111,
            ))
        });

        it('should write a uint8', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write8(0xA5);

            expect(writer.byteLength).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xA5, 0x00))
        });

        it('should write a uint16', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter({buffer});
            writer.write16(0x1234);

            expect(writer.byteLength).equal(2);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12, 0x34))
        });

        it('should write a uint32', () => {
            const buffer = new ArrayBuffer(4);
            const writer = new BitWriter({buffer});
            writer.write32(0x12345678);

            expect(writer.byteLength).equal(4);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12, 0x34, 0x56, 0x78))
        });
    });

    describe('byte alignment', () => {
       it('should say if its aligned or not', () => {
           const buffer = new ArrayBuffer(4);
           const writer = new BitWriter({buffer});
           for (let i = 0; i < 32; i++) {
               expect(writer.isAligned()).to.equal(i % 8 === 0);
               writer.on();
           }
       });

       it('should be able to be aligned to the next byte', () => {
           const writer = new BitWriter();
           writer.on();
           writer.byteAlign();
           writer.write2(3);
           writer.byteAlign();
           writer.write3(7);

           expect(writer.byteLength).to.equal(3);

           const buffer = new ArrayBuffer(writer.byteLength);
           writer.copyTo(buffer);
           expect(new Uint8Array(buffer)).to.deep.equal(Uint8Array.of(
               0b1000_0000,
               0b1100_0000,
               0b1110_0000,
           ))
       })
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

            const actual = new Uint8Array(writer.buffer, 0, writer.byteLength);
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
            const actual = new Uint8Array(writer.buffer, 0, writer.byteLength);
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

    describe('errors', () => {
        it('should throw when out of buffer space', () => {
            const buffer = new ArrayBuffer(1);
            const w = new BitWriter({ buffer });
            w.write8(0xff)
            expect(() => { w.write(0x01, 1) }).to.throw();
        });

        it('should throw an error if there is not enough target space', () => {
            const buffer = new ArrayBuffer(4);
            const w = new BitWriter({ buffer });
            w.write32(0xff)

            const target = new ArrayBuffer(3);
            expect(() => w.copyTo(target)).to.throw(/not enough space/);
        });
    });
});