import { expect } from 'chai';

import BitWriter from '../src/bit-writer';

describe('BitWriter', () =>{
    describe('with fixed buffer', () => {
        it('should write some simple bits', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter(buffer);
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

            expect(writer.position).equal(2);

            const bytes = new Uint8Array(buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xff,0xA5))
        });

        it('should write one bit at a time', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter(buffer);
            writer.write1(true);

            expect(writer.position).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0b1000_0000,0x00))
        });

        it('should write a uint8', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter(buffer);
            writer.write(0xA5, 8);

            expect(writer.position).equal(1);

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0xA5,0x00))
        });

        it('should write a uint16', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter(buffer);
            writer.write(0x1234, 16);

            expect(writer.position).equal(2)

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12,0x34))
        });

        it('should write a uint32', () => {
            const buffer = new ArrayBuffer(4);
            const writer = new BitWriter(buffer);
            writer.write(0x12345678, 32);

            expect(writer.position).equal(4)

            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x12,0x34,0x56,0x78))
        });

        it('should write a unaligned byte', () => {
            const buffer = new ArrayBuffer(2);
            const writer = new BitWriter(buffer);
            writer.write(0x5, 4);
            expect(writer.position).equal(1);
            writer.write(0x5A, 8);
            expect(writer.position).equal(2);
            writer.write(0xA, 4);
            expect(writer.position).equal(2);


            const bytes = new Uint8Array(writer.buffer);
            expect(bytes).to.deep.equal(Uint8Array.of(0x55, 0xAA))
        });

        it('should respect start position', () => {
            const buffer = new ArrayBuffer(16);
            const writer = new BitWriter(buffer, 4);
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
});