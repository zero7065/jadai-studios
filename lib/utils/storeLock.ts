// lib/utils/storeLock.ts
// Per-key async mutex for fs-backed stores.
//
// Each store does read-modify-write (read JSON → mutate → atomic tmp+rename).
// Without a lock, two concurrent requests can both read the same snapshot and
// the second write silently discards the first (lost update). This serializes
// writers per store file so a 500+ user burst can't corrupt or drop entitlements,
// memory facts, or RAG docs.
//
// Usage:
//   const release = await acquireStoreLock('entitlements');
//   try { ...read/modify/write... } finally { release(); }

const locks = new Map<string, Promise<void>>();

export async function acquireStoreLock(key: string): Promise<() => void> {
  const previous = locks.get(key) || Promise.resolve();

  let releaseCurrent!: () => void;
  const current = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });

  // Chain: the next caller waits for both the previous holder and us.
  locks.set(
    key,
    previous.then(() => current)
  );

  // Wait for the previous holder to release before entering the critical section.
  await previous;

  return () => {
    releaseCurrent();
    // Drop the map entry once this holder is the tail (no one queued behind).
    if (locks.get(key) === current || locks.get(key)?.toString() === current.toString()) {
      // no-op; cleaned on next acquire
    }
  };
}

/** Run `fn` while holding the lock for `key`. Serializes concurrent callers. */
export async function withStoreLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
  const release = await acquireStoreLock(key);
  try {
    return await fn();
  } finally {
    release();
  }
}

/**
 * Synchronous variant. Node runs this module on a single event-loop thread, so a
 * fully-synchronous read-modify-write cannot interleave with another — the
 * hazard is only *async* awaits between read and write (those need
 * `withStoreLock`). This exists so sync fs mutations share a call shape with
 * the async path and stay forward-compatible if a store ever gains async work.
 */
export function withStoreLockSync<T>(_key: string, fn: () => T): T {
  return fn();
}
