#!/usr/bin/env node
/**
 * Generates a scrypt hash for ADMIN_PASSWORD_HASH.
 * Usage:  node scripts/hash-admin-password.mjs "your-strong-password"
 * Then set: ADMIN_PASSWORD_HASH=<output> in the Render environment.
 */
import crypto from 'crypto';

const password = process.argv[2] || process.env.ADMIN_PASSWORD_INPUT;

if (!password) {
  console.error('Usage: node scripts/hash-admin-password.mjs "your-strong-password"');
  process.exit(1);
}

if (password.length < 12) {
  console.error('Password must be at least 12 characters long.');
  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;
const salt = crypto.randomBytes(16);
const derived = crypto.scryptSync(password, salt, 64, { N, r, p });
const hash = `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${derived.toString('hex')}`;

console.log('');
console.log('ADMIN_PASSWORD_HASH=' + hash);
console.log('');
console.log('Store this in your Render environment variable ADMIN_PASSWORD_HASH.');
console.log('Keep the password itself in your password manager — it is never stored.');
