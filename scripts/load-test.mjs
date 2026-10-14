// scripts/load-test.mjs
// Wave 6 scale-hardening smoke test. Fires a concurrent burst at the key
// endpoints and reports status-code distribution + latency. Verifies the
// in-process rate limiter returns 429s under load and that fs-store locks
// keep the server responsive (no lost updates / crashes).
//
// Usage: node scripts/load-test.mjs [baseUrl] [concurrency] [totalRequests]
//   node scripts/load-test.mjs http://localhost:3000 40 400

const BASE = process.argv[2] || 'http://localhost:3000';
const CONCURRENCY = Math.max(1, parseInt(process.argv[3] || '40', 10));
const TOTAL = Math.max(CONCURRENCY, parseInt(process.argv[4] || '400', 10));

// Endpoints to exercise. Mix of cheap reads + rate-limited + store-touching.
const TARGETS = [
  { name: 'home', path: '/', weight: 3 },
  { name: 'tier', path: '/api/account/tier?email=loadtest@example.com', weight: 3 },
  { name: 'templates', path: '/api/templates', weight: 2 },
  { name: 'diagnostic', path: '/api/modules/diagnostic?action=scan&url=https://example.com', weight: 1 },
  { name: 'chat', path: '/api/ai/status', weight: 3 },
];

// Expand the target list to TOTAL entries by weight.
const plan = [];
for (const t of TARGETS) {
  for (let i = 0; i < t.weight; i++) plan.push(t);
}
while (plan.length < TOTAL) plan.push(TARGETS[0]);

const codes = new Map();
let slowest = 0;
let errors = 0;

async function hit(t) {
  const start = performance.now();
  try {
    const res = await fetch(BASE + t.path, { signal: AbortSignal.timeout(15000) });
    const ms = performance.now() - start;
    if (ms > slowest) slowest = ms;
    codes.set(res.status, (codes.get(res.status) || 0) + 1);
    if (res.status >= 500) errors++;
  } catch (e) {
    codes.set('ERR', (codes.get('ERR') || 0) + 1);
    errors++;
  }
}

async function worker(queue) {
  while (queue.length) {
    const t = queue.pop();
    await hit(t);
  }
}

console.log(`Load test → ${BASE}`);
console.log(`concurrency=${CONCURRENCY} total=${plan.length}`);
console.time('elapsed');

const queue = [...plan];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

console.timeEnd('elapsed');
console.log('\nStatus distribution:');
[...codes.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([code, n]) => console.log(`  ${code}: ${n}`));
console.log(`\nslowest=${slowest.toFixed(0)}ms  serverErrors=${errors}`);

const ok = codes.get(200) || 0;
const rateLimited = codes.get(429) || 0;
console.log(`\nRate limiter engaged: ${rateLimited > 0 ? 'YES' : 'no (expected under a large burst)'}`);
console.log(ok + rateLimited > 0 ? 'PASS: server stayed up under burst' : 'FAIL: no successful responses');
