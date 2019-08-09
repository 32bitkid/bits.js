import { expect } from 'chai';

import BitReader from '../src/bit-reader';

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
            expect(r.peek(1)).to.equal(0b0);
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
        const { buffer } = Uint8Array.of(0xff, 0x00, 0x81, 0x18, 0xAA, 0x55, 0xA5, 0x5A, 0x01);

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
        });

        it('should the correct bits, even when the stream is preloaded', () => {
            const r = new BitReader(buffer);
            r.peek(1);
            r.skip(64);
            expect(r.peek(8)).to.equal(0x01);
        });
    });

    describe('take()', () => {
        const { buffer } = Uint8Array.of(0xff, 0x00, 0x81, 0x18, 0xAA, 0x55, 0xA5, 0x5A, 0x00);
        it('should read bits and move forward', () => {
            const r = new BitReader(buffer);
            expect(r.take(4)).to.equal(0xf);
            expect(r.take(4)).to.equal(0xf);

            expect(r.take(4)).to.equal(0x0);
            expect(r.take(4)).to.equal(0x0);

            expect(r.take(2)).to.equal(0b10);
            expect(r.take(2)).to.equal(0b00);
            expect(r.take(2)).to.equal(0b00);
            expect(r.take(2)).to.equal(0b01);

            expect(r.take(8)).to.equal(0x18);

            expect(r.take(4)).to.equal(0xA);
            expect(r.take(2)).to.equal(0b10);
            expect(r.take(1)).to.equal(0b1);
            expect(r.take(1)).to.equal(0b0);

            expect(r.take(32)).to.equal(0x55A55A00);
        });

        it('should handle non-aligned multi-byte reads', () => {
            const r = new BitReader(buffer);
            r.skip(2);
            expect(r.take(24)).to.equal(0b11_1111_0000_0000_1000_0001_00);
            expect(r.take(6)).to.equal(0b01_1000);
        });

        it('take the whole thing', () => {
            const r = new BitReader(buffer);
            expect(r.take(32)).to.equal(0xff008118);
        })
    });

    describe('byteAlign()', () => {
        const { buffer } = Uint8Array.of(0x81, 0x18);
        it('should be a noop if already aligned', () => {
            const r = new BitReader(buffer);
            expect(r.peek(4)).to.equal(0x8);
            expect(r.byteAlign()).to.equal(0);
            expect(r.peek(4)).to.equal(0x8);
        });

        it('should return the number of bits skipped', () => {
            for (let i = 1; i < 8; i++) {
                const r = new BitReader(buffer);
                r.skip(i);
                expect(8 - r.byteAlign()).to.equal(i);
                expect(r.peek(8)).to.equal(0x18);
            }
        });
    });

    describe('edge cases', () =>{
        it('should handle unaligned take >24 bits', () => {
            const { buffer } = Uint8Array.of(0x01, 0x23, 0x45, 0x67, 0x80);
            const r =  new BitReader(buffer);
            r.skip(4);
            expect(r.take(32)).to.equal(0x12345678);
        });

        it('should peek to the next byte when unaligned', () => {
            const { buffer } = Uint8Array.of(0x01, 0x23, 0x45, 0x67, 0x80);
            const r =  new BitReader(buffer);
            r.skip(4);
            expect(r.peek(28)).to.equal(0x1234567);
        });

        it('should throw if peek goes beyond last byte boundry', () => {
            const { buffer } = Uint8Array.of(0x01, 0x23, 0x45, 0x67, 0x80);
            const r =  new BitReader(buffer);
            r.skip(7);
            expect(() => { r.peek(26) }).to.throw(/unaligned peek/);
            expect(() => { r.peek(32) }).to.throw(/unaligned peek/);
        });

        it('should peek, even if it needs to fill the buffer first', () => {
            const { buffer } = Uint8Array.of(0x01, 0x23, 0x45, 0x67, 0x80, 0x01, 0x23, 0x45, 0x67, 0x80);
            const r =  new BitReader(buffer);
            r.take(28);
            expect(r.peek(28)).to.equal(0x7800123);
        });
    });

    describe('isAligned', () => {
       it('should work', () => {
           const { buffer } = Uint8Array.of(0x76, 0x54, 0x32, 0x10);
           const r =  new BitReader(buffer);
           for (let i = 0; i < 32; i++) {
               expect(r.isAligned()).to.equal(i%8===0);
               r.skip(1);
           }
       })
    });

    describe('errors', () => {
        it('should throw with zero peek/take/skip',  () =>{
            const { buffer } = Uint8Array.of(0x76, 0x54, 0x32, 0x10);
            const r =  new BitReader(buffer);
            expect(() => { r.peek(0) }).to.throw(/out of range/);
            expect(() => { r.take(0) }).to.throw(/out of range/);
            expect(() => { r.skip(0) }).to.throw(/out of range/);
        });

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