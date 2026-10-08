#!/usr/bin/env node
/**
 * Applies rewritten content batches to Book of Lies source files.
 * Replaces ONLY tagline / teaser / full_text per slug — every other field
 * (id, slug, title, episode_number, act, sin, dates, counters) is untouched.
 *
 * Usage: node scripts/tmp-apply.cjs scripts/content/<batch>.cjs lib/data/<file>.ts
 */
const fs = require('fs');

const batchPath = process.argv[2];
const targetPath = process.argv[3];
if (!batchPath || !targetPath) {
  console.error('Usage: node scripts/tmp-apply.cjs <batch.cjs> <target.ts>');
  process.exit(1);
}

const batch = require(require('path').resolve(batchPath));
let content = fs.readFileSync(targetPath, 'utf8');

const escSingle = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const escTick = (s) => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

let ok = 0;
for (const item of batch) {
  const slugToken = `slug: '${item.slug}'`;
  let slugIdx = content.indexOf(slugToken);
  if (slugIdx === -1) slugIdx = content.indexOf(`slug: "${item.slug}"`);
  if (slugIdx === -1) throw new Error('slug not found: ' + item.slug);

  const objStart = content.lastIndexOf('\n  {', slugIdx);
  const objEnd = content.indexOf('\n  },', slugIdx);
  if (objStart === -1 || objEnd === -1 || objEnd < objStart) {
    throw new Error('object bounds not found for: ' + item.slug);
  }

  let seg = content.slice(objStart, objEnd);

  const before = seg;
  seg = seg.replace(/tagline: (['"])[\s\S]*?\1(?=,?\n)/, () => `tagline: '${escSingle(item.tagline)}'`);
  seg = seg.replace(/teaser: (['"])[\s\S]*?\1(?=,?\n)/, () => `teaser: '${escSingle(item.teaser)}'`);
  seg = seg.replace(/full_text: `[\s\S]*`/, () => 'full_text: `' + escTick(item.full_text) + '`');

  if (!/tagline: (['"])[\s\S]*?\1(?=,?\n)/.test(before) || !/teaser: (['"])[\s\S]*?\1(?=,?\n)/.test(before) || !/full_text: `[\s\S]*`/.test(before)) {
    throw new Error('expected fields missing for: ' + item.slug);
  }
  if (!seg.includes(`tagline: '${escSingle(item.tagline)}'`) || !seg.includes('full_text: `')) {
    throw new Error('replacement verification failed for: ' + item.slug);
  }
  if (!seg.includes(item.slug) || seg.split('tagline:').length !== 2) {
    // sanity: tagline appears exactly once
    throw new Error('sanity check failed for: ' + item.slug);
  }

  content = content.slice(0, objStart) + seg + content.slice(objEnd);
  ok++;
  console.log('  applied:', item.slug);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log(`DONE: ${ok} episodes updated in ${targetPath}`);
