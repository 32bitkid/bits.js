import { expect } from 'chai';

import BitReader from '../src/reader';

describe('BitReader', () => {
    describe('peek()', () => {
        it('should handle all 1s', () => {
            const { buffer } = Uint8Array.of(0xff, 0xff, 0xff, 0xff);
            const r =  new BitReader(buffer);
            expect(r.peek(1)).to.equal(0b1);
            expect(r.peek(2)).to.equal(0b11);
            expect(r.peek(3)).to.equal(0b111);
            expect(r.peek(4)).to.equal(0b1111);
            expect(r.peek(5)).to.equal(0b11111);
            expect(r.peek(6)).to.equal(0b111111);
            expect(r.peek(7)).to.equal(0b1111111);
            expect(r.peek(8)).to.equal(0b11111111);
            expect(r.peek(9)).to.equal(0b111111111);
            expect(r.peek(10)).to.equal(0b1111111111);
            expect(r.peek(11)).to.equal(0b11111111111);
            expect(r.peek(12)).to.equal(0b111111111111);
            expect(r.peek(13)).to.equal(0b1111111111111);
            expect(r.peek(14)).to.equal(0b11111111111111);
            expect(r.peek(15)).to.equal(0b111111111111111);
            expect(r.peek(16)).to.equal(0b1111111111111111);
            expect(r.peek(17)).to.equal(0b11111111111111111);
            expect(r.peek(18)).to.equal(0b111111111111111111);
            expect(r.peek(19)).to.equal(0b1111111111111111111);
            expect(r.peek(20)).to.equal(0b11111111111111111111);
            expect(r.peek(21)).to.equal(0b111111111111111111111);
            expect(r.peek(22)).to.equal(0b1111111111111111111111);
            expect(r.peek(23)).to.equal(0b11111111111111111111111);
            expect(r.peek(24)).to.equal(0b111111111111111111111111);
            expect(r.peek(25)).to.equal(0b1111111111111111111111111);
            expect(r.peek(26)).to.equal(0b11111111111111111111111111);
            expect(r.peek(27)).to.equal(0b111111111111111111111111111);
            expect(r.peek(28)).to.equal(0b1111111111111111111111111111);
            expect(r.peek(29)).to.equal(0b11111111111111111111111111111);
            expect(r.peek(30)).to.equal(0b111111111111111111111111111111);
            expect(r.peek(31)).to.equal(0b1111111111111111111111111111111);
            expect(r.peek(32)).to.equal(0b11111111111111111111111111111111);
        });

        it('should handle all 0s', () => {
            const { buffer } = Uint8Array.of(0x00, 0x00, 0x00, 0x00);
            const r =  new BitReader(buffer);
            expect(r.peek(0)).to.equal(0b0);
            expect(r.peek(2)).to.equal(0b00);
            expect(r.peek(3)).to.equal(0b000);
            expect(r.peek(4)).to.equal(0b0000);
            expect(r.peek(5)).to.equal(0b00000);
            expect(r.peek(6)).to.equal(0b000000);
            expect(r.peek(7)).to.equal(0b0000000);
            expect(r.peek(8)).to.equal(0b00000000);
            expect(r.peek(9)).to.equal(0b000000000);
            expect(r.peek(10)).to.equal(0b0000000000);
            expect(r.peek(11)).to.equal(0b00000000000);
            expect(r.peek(12)).to.equal(0b000000000000);
            expect(r.peek(13)).to.equal(0b0000000000000);
            expect(r.peek(14)).to.equal(0b00000000000000);
            expect(r.peek(15)).to.equal(0b000000000000000);
            expect(r.peek(16)).to.equal(0b0000000000000000);
            expect(r.peek(17)).to.equal(0b00000000000000000);
            expect(r.peek(18)).to.equal(0b000000000000000000);
            expect(r.peek(19)).to.equal(0b0000000000000000000);
            expect(r.peek(20)).to.equal(0b00000000000000000000);
            expect(r.peek(21)).to.equal(0b000000000000000000000);
            expect(r.peek(22)).to.equal(0b0000000000000000000000);
            expect(r.peek(23)).to.equal(0b00000000000000000000000);
            expect(r.peek(24)).to.equal(0b000000000000000000000000);
            expect(r.peek(25)).to.equal(0b0000000000000000000000000);
            expect(r.peek(26)).to.equal(0b00000000000000000000000000);
            expect(r.peek(27)).to.equal(0b000000000000000000000000000);
            expect(r.peek(28)).to.equal(0b0000000000000000000000000000);
            expect(r.peek(29)).to.equal(0b00000000000000000000000000000);
            expect(r.peek(30)).to.equal(0b000000000000000000000000000000);
            expect(r.peek(31)).to.equal(0b0000000000000000000000000000000);
            expect(r.peek(32)).to.equal(0b00000000000000000000000000000000);
        });

        it('should handle all alternating 10s', () => {
            const { buffer } = Uint8Array.of(0xaa, 0xaa, 0xaa, 0xaa);
            const r =  new BitReader(buffer);
            for (let l = 1; l <= 32; l++) {
                const shift = (32-l);
                expect(r.peek(l)).to.equal(0b10101010101010101010101010101010 >>> shift);
            }
        });

        it('should handle all alternating 01s', () => {
            const { buffer } = Uint8Array.of(0x55, 0x55, 0x55, 0x55);
            const r =  new BitReader(buffer);
            for (let l = 1; l <= 32; l++) {
                const shift = (32-l);
                expect(r.peek(l)).to.equal(0b01010101010101010101010101010101 >>> shift);
            }
        });

    });

    describe('skip()', () => {
        const { buffer } = Uint8Array.of(0xff, 0x00, 0x81, 0x18, 0xAA, 0x55, 0xA5, 0x5A);

        it('should skip bits in the stream', () => {
            const r = new BitReader(buffer);
            expect(r.peek(1)).to.equal(1);
            r.skip(1);
            expect(r.peek(1)).to.equal(1);
            r.skip(7);
            expect(r.peek(1)).to.equal(0);
            r.skip(8);
            expect(r.peek(4)).to.equal(0x8);
            r.skip(4);
            expect(r.peek(8)).to.equal(0x11);
            r.skip(8);
            expect(r.peek(16)).to.equal(0x8AA5);
        })
    });

    describe('take()', () => {
        const { buffer } = Uint8Array.of(0xff, 0x00, 0x81, 0x18, 0xAA, 0x55, 0xA5, 0x5A);

    });

    describe('edge cases', () =>{
        it('should handle unaligned take >24 bits', () => {
            const { buffer } = Uint8Array.of(0x01, 0x23, 0x45, 0x67, 0x80);
            const r =  new BitReader(buffer);
            r.skip(4);
            expect(r.take(32)).to.equal(0x12345678);
        })
    });

    describe('errors', () => {
        it('should throw with negative peek/take/skip',  () =>{
            const { buffer } = Uint8Array.of(0x76, 0x54, 0x32, 0x10);
            const r =  new BitReader(buffer);
            expect(() => { r.peek(-1) }).to.throw(/out of range/);
            expect(() => { r.take(-1) }).to.throw(/out of range/);
            expect(() => { r.skip(-1) }).to.throw(/out of range/);
        });

        it('should throw with peek/read len>32',  () =>{
            const { buffer } = Uint8Array.of(0x76, 0x54, 0x32, 0x10);
            const r =  new BitReader(buffer);
            expect(() => { r.peek(33) }).to.throw(/out of range/);
            expect(() => { r.take(33) }).to.throw(/out of range/);
        });

        it('should throw if reading beyond the end of the stream',  () =>{
            const r =  new BitReader(new ArrayBuffer(0));
            expect(() => { r.peek(8) }).to.throw(/unexpected end of stream/);
            expect(() => { r.take(8) }).to.throw(/unexpected end of stream/);
            expect(() => { r.skip(8) }).to.throw(/unexpected end of stream/);
        });
    })
});