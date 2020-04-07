export default interface BitReader {
    skip(len: number): void;
    peek(len: number): number;
    take(len: number): number;
    byteAlign(): number;
    isAligned(): boolean;
}
