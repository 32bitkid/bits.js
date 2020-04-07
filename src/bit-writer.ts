export default interface BitWriter {
  readonly byteLength: number;

  write(val: number, width: number): BitWriter;

  on(): BitWriter;
  off(): BitWriter;
  write1(...values: (boolean | 0 | 1)[]): BitWriter;
  write2(...values: (0 | 1 | 2 | 3)[]): BitWriter;
  write3(...values: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[]): BitWriter;
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
