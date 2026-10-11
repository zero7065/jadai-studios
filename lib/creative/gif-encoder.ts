// Pure-TypeScript GIF89a encoder (no dependencies, runs in the browser).
// Median-cut palette quantization + standard GIF LZW compression.

export interface GifFrameInput {
  imageData: ImageData;
  /** Frame delay in milliseconds (browsers clamp below ~20ms). */
  delayMs: number;
}

interface Palette {
  colors: Array<[number, number, number]>;
}

function medianCut(samples: Array<[number, number, number]>, maxColors: number): Palette {
  let boxes: Array<Array<[number, number, number]>> = [samples];

  while (boxes.length < maxColors) {
    // Pick the box with the largest channel range.
    let boxIndex = -1;
    let bestRange = -1;
    let splitChannel = 0;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.length < 2) continue;
      for (let c = 0; c < 3; c++) {
        let min = 255;
        let max = 0;
        for (const p of box) {
          const v = p[c];
          if (v < min) min = v;
          if (v > max) max = v;
        }
        const range = max - min;
        if (range > bestRange) {
          bestRange = range;
          boxIndex = i;
          splitChannel = c;
        }
      }
    }
    if (boxIndex === -1 || bestRange <= 0) break;

    const box = boxes[boxIndex];
    box.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = box.length >> 1;
    boxes.splice(boxIndex, 1, box.slice(0, mid), box.slice(mid));
  }

  const colors = boxes.map((box) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const p of box) {
      r += p[0];
      g += p[1];
      b += p[2];
    }
    const n = Math.max(1, box.length);
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)] as [number, number, number];
  });

  return { colors };
}

function buildColorCache(palette: Palette) {
  const cache = new Map<number, number>();
  const nearest = (r: number, g: number, b: number): number => {
    // Exact RGB key — quantized keys flip close nearest-color calls and
    // visibly shift colors on smooth gradients.
    const key = (r << 16) | (g << 8) | b;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;

    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < palette.colors.length; i++) {
      const [pr, pg, pb] = palette.colors[i];
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
        if (dist === 0) break;
      }
    }
    cache.set(key, best);
    return best;
  };
  return nearest;
}

// --- GIF LZW compressor -----------------------------------------------------

class BitWriter {
  private bytes: number[] = [];
  private bitBuffer = 0;
  private bitCount = 0;

  writeBits(value: number, length: number): void {
    for (let i = 0; i < length; i++) {
      const bit = (value >> i) & 1;
      this.bitBuffer |= bit << this.bitCount;
      this.bitCount++;
      if (this.bitCount === 8) {
        this.bytes.push(this.bitBuffer & 0xff);
        this.bitBuffer = 0;
        this.bitCount = 0;
      }
    }
  }

  finish(): number[] {
    if (this.bitCount > 0) {
      this.bytes.push(this.bitBuffer & 0xff);
      this.bitBuffer = 0;
      this.bitCount = 0;
    }
    return this.bytes;
  }
}

function lzwEncode(indices: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  const writer = new BitWriter();
  const dict = new Map<number, number>();

  const resetDict = () => {
    dict.clear();
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  };

  writer.writeBits(clearCode, codeSize);

  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = (prefix << 8) | k;
    const existing = dict.get(key);
    if (existing !== undefined) {
      prefix = existing;
      continue;
    }

    writer.writeBits(prefix, codeSize);
    dict.set(key, nextCode);
    nextCode++;

    if (nextCode === 4096) {
      // Table full (max code 4095) — reset before assigning further.
      writer.writeBits(clearCode, codeSize);
      resetDict();
    } else if (nextCode > 1 << codeSize && codeSize < 12) {
      codeSize++;
    }

    prefix = k;
  }

  writer.writeBits(prefix, codeSize);
  writer.writeBits(eoiCode, codeSize);

  const raw = writer.finish();
  // Pack into ≤255-byte sub-blocks.
  const out: number[] = [];
  for (let i = 0; i < raw.length; i += 255) {
    const chunk = raw.slice(i, i + 255);
    out.push(chunk.length, ...chunk);
  }
  out.push(0); // block terminator
  return out;
}

// --- Encoder ----------------------------------------------------------------

function writeString(arr: number[], s: string): void {
  for (let i = 0; i < s.length; i++) arr.push(s.charCodeAt(i));
}

function writeShort(arr: number[], value: number): void {
  arr.push(value & 0xff, (value >> 8) & 0xff);
}

/**
 * Encode frames into a single animated GIF89a byte array.
 * Uses one global palette derived from a sample of all frames.
 */
export function encodeGif(width: number, height: number, frames: GifFrameInput[]): Uint8Array<ArrayBuffer> {
  if (frames.length === 0) throw new Error('encodeGif: no frames');

  // 1. Sample pixels across all frames for the global palette.
  const samples: Array<[number, number, number]> = [];
  const sampleStride = Math.max(1, Math.floor((width * height * frames.length) / 40000));
  for (const frame of frames) {
    const data = frame.imageData.data;
    let pixelIndex = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (pixelIndex % sampleStride === 0) {
        samples.push([data[i], data[i + 1], data[i + 2]]);
      }
      pixelIndex++;
    }
  }
  const palette = medianCut(samples, 256);
  const nearest = buildColorCache(palette);

  // 2. Color table must be a power of two (2..256).
  let tableSize = 2;
  while (tableSize < palette.colors.length) tableSize <<= 1;
  const tableEntries = Math.max(2, tableSize);

  const out: number[] = [];
  writeString(out, 'GIF89a');
  writeShort(out, width);
  writeShort(out, height);
  // Packed: GCT flag(1) | color resolution(7) | sort(0) | size(7 bits log2-1)
  const sizeBits = Math.log2(tableEntries) - 1;
  out.push(0b11110000 | (sizeBits & 0x07), 0, 0); // packed, background index, aspect
  for (let i = 0; i < tableEntries; i++) {
    const c = palette.colors[i] || [0, 0, 0];
    out.push(c[0], c[1], c[2]);
  }

  // 3. Netscape looping extension (infinite loop).
  out.push(0x21, 0xff, 0x0b);
  writeString(out, 'NETSCAPE2.0');
  out.push(0x03, 0x01);
  writeShort(out, 0); // loop count: 0 = forever
  out.push(0x00);

  // 4. Frames.
  for (const frame of frames) {
    const delayCs = Math.max(2, Math.round(frame.delayMs / 10));

    // Graphic Control Extension
    out.push(0x21, 0xf9, 0x04, 0b00000100); // disposal=1 (do not dispose), no transparency
    writeShort(out, delayCs);
    out.push(0x00, 0x00);

    // Image Descriptor
    out.push(0x2c);
    writeShort(out, 0);
    writeShort(out, 0);
    writeShort(out, width);
    writeShort(out, height);
    out.push(0x00); // no local color table, not interlaced

    // Map pixels to palette indices.
    const pixelCount = width * height;
    const indices = new Uint8Array(pixelCount);
    const data = frame.imageData.data;
    for (let p = 0, i = 0; p < pixelCount; p++, i += 4) {
      indices[p] = nearest(data[i], data[i + 1], data[i + 2]);
    }

    const minCodeSize = 8;
    out.push(minCodeSize);
    const compressed = lzwEncode(indices, minCodeSize);
    for (let i = 0; i < compressed.length; i++) out.push(compressed[i]);
  }

  // 5. Trailer
  out.push(0x3b);

  return Uint8Array.from(out);
}
