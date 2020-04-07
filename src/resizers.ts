export type ArrayBufferResizer = (buffer?: ArrayBuffer) => ArrayBuffer;

export function createChunkAllocator(chunkSize = 0x10000): ArrayBufferResizer {
  return function onResize(src?: ArrayBuffer): ArrayBuffer {
    if (src === undefined) return new ArrayBuffer(chunkSize);

    const dst = new ArrayBuffer(src.byteLength + chunkSize);
    new Uint8Array(dst).set(new Uint8Array(src), 0);
    return dst;
  };
}

export function createResizer(initialSize = 0x10000): ArrayBufferResizer {
  return function onResize(src?: ArrayBuffer): ArrayBuffer {
    if (src === undefined) return new ArrayBuffer(initialSize);

    const dst = new ArrayBuffer(src.byteLength * 2 || 1);
    new Uint8Array(dst).set(new Uint8Array(src), 0);
    return dst;
  };
}

export function resizeNotSupported(buffer?: ArrayBuffer): ArrayBuffer {
  throw new Error(buffer === undefined ? 'buffer is required' : 'overflow: out of buffer space');
}
