#!/usr/bin/env node
/**
 * Generates the PWA icon set from scratch (no image deps):
 *   public/assets/logo/icon-192.png
 *   public/assets/logo/icon-512.png
 *   public/favicon.ico
 *
 * Design: void-black field, gold compass ring, blocky "J" monogram
 * (the load-path sigil: plan square + J resolving to the floor).
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const GOLD = [201, 168, 76];      // #C9A84C
const GOLD_BRIGHT = [232, 201, 106]; // #e8c96a
const VOID = [5, 4, 4];           // #050404

// --- PNG encoder -------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(rgba, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- drawing -----------------------------------------------------------------
// Renders at size*SS then box-downsamples 4x for antialiasing.
const SS = 4;

function renderIcon(size) {
  const S = size * SS;
  const buf = Buffer.alloc(S * S * 4);

  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return;
    const i = (y * S + x) * 4;
    if (a >= 255) {
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
    } else {
      const na = a / 255;
      buf[i] = Math.round(buf[i] * (1 - na) + r * na);
      buf[i + 1] = Math.round(buf[i + 1] * (1 - na) + g * na);
      buf[i + 2] = Math.round(buf[i + 2] * (1 - na) + b * na);
      buf[i + 3] = 255;
    }
  };

  const rect = (x0, y0, x1, y1, color) => {
    for (let y = Math.round(y0 * S); y < Math.round(y1 * S); y++)
      for (let x = Math.round(x0 * S); x < Math.round(x1 * S); x++) set(x, y, color);
  };

  // Field
  rect(0, 0, 1, 1, VOID);

  // Compass ring (gold annulus)
  const cx = 0.5 * S;
  const cy = 0.5 * S;
  const rMid = 0.375 * S;
  const halfT = 0.028 * S;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const t = Math.abs(d - rMid);
      if (t <= halfT) set(x, y, GOLD);
      else if (t <= halfT + 1.5 * SS) set(x, y, GOLD, Math.round(160 * (1 - t / (halfT + 1.5 * SS))));
    }
  }

  // Apex pulse dot (12 o'clock on the ring — the charge point of the sigil)
  const ax = 0.5 * S;
  const ay = 0.5 * S - rMid;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (Math.hypot(x - ax, y - ay) <= 0.05 * S) set(x, y, GOLD_BRIGHT);
    }
  }

  // Blocky J: stem + bottom hook resolving to the floor line
  const stemW = 0.085;
  rect(0.50, 0.30, 0.50 + stemW, 0.64, GOLD);           // vertical stem (right)
  rect(0.375, 0.575, 0.50 + stemW, 0.66, GOLD);          // bottom bar
  rect(0.375, 0.47, 0.375 + stemW, 0.66, GOLD);          // left hook rising

  // Blueprint floor line under the J
  rect(0.30, 0.71, 0.70, 0.71 + 0.016, GOLD);

  // Downsample
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * S + (x * SS + sx)) * 4;
          r += buf[i]; g += buf[i + 1]; b += buf[i + 2]; a += buf[i + 3];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = Math.round(a / n);
    }
  }
  return encodePng(out, size, size);
}

function encodeIco(pngBuffers /* [{size, png}] */) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];
  const datas = [];
  for (const { size, png } of pngBuffers) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size; // width
    e[1] = size >= 256 ? 0 : size; // height
    e[2] = 0;  // palette
    e[3] = 0;  // reserved
    e.writeUInt16LE(1, 4);   // planes
    e.writeUInt16LE(32, 6);  // bpp
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
    datas.push(png);
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

// --- main --------------------------------------------------------------------
const outDir = path.join(process.cwd(), 'public', 'assets', 'logo');
fs.mkdirSync(outDir, { recursive: true });

const icon192 = renderIcon(192);
const icon512 = renderIcon(512);
const icon48 = renderIcon(48);
const icon32 = renderIcon(32);

fs.writeFileSync(path.join(outDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), encodeIco([
  { size: 32, png: icon32 },
  { size: 48, png: icon48 },
]));

console.log('Generated:');
console.log('  public/assets/logo/icon-192.png (' + icon192.length + ' bytes)');
console.log('  public/assets/logo/icon-512.png (' + icon512.length + ' bytes)');
console.log('  public/favicon.ico');
