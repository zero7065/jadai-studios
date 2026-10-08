// /lib/prime/memory-device.ts
// Device Storage Memory (IndexedDB + localStorage fallback) for persistent user context

const DB_NAME = 'jadai-prime-memory';
const DB_VERSION = 1;

export interface PrimeMemoryItem {
  id?: number;
  userId: string;
  type: 'profile' | 'preference' | 'insight' | 'goal' | 'context' | 'pattern';
  key: string;
  value: string;
  confidence: number;
  createdAt: string;
}

export async function initMemoryDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }

  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('memories')) {
          const store = db.createObjectStore('memories', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null); // gracefully fall back
    } catch {
      resolve(null);
    }
  });
}

export async function saveMemory(
  userId: string,
  memory: {
    type: 'profile' | 'preference' | 'insight' | 'goal' | 'context' | 'pattern';
    key: string;
    value: string;
    confidence: number;
  }
): Promise<void> {
  const item: PrimeMemoryItem = {
    ...memory,
    userId,
    createdAt: new Date().toISOString(),
  };

  try {
    const db = await initMemoryDB();
    if (db) {
      const tx = db.transaction('memories', 'readwrite');
      const store = tx.objectStore('memories');
      await new Promise<void>((resolve, reject) => {
        const req = store.add(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  } catch (err) {
    console.warn('IndexedDB save failed, using local storage fallback', err);
  }

  // Also maintain localStorage mirror for ultra-fast instant lookups and fallback
  try {
    const key = `jadai_memories_${userId}`;
    const raw = localStorage.getItem(key);
    const list: PrimeMemoryItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    // Keep last 100 in local storage mirror
    localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
  } catch {
    // Non-blocking
  }
}

export async function loadMemories(userId: string): Promise<PrimeMemoryItem[]> {
  try {
    const db = await initMemoryDB();
    if (db) {
      return new Promise<PrimeMemoryItem[]>((resolve) => {
        const tx = db.transaction('memories', 'readonly');
        const store = tx.objectStore('memories');
        const index = store.index('userId');
        const req = index.getAll(userId);
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result);
          } else {
            resolve(loadMemoriesFromLocalStorage(userId));
          }
        };
        req.onerror = () => resolve(loadMemoriesFromLocalStorage(userId));
      });
    }
  } catch {
    // Fall back to local storage
  }

  return loadMemoriesFromLocalStorage(userId);
}

function loadMemoriesFromLocalStorage(userId: string): PrimeMemoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`jadai_memories_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearMemories(userId: string): Promise<void> {
  try {
    const db = await initMemoryDB();
    if (db) {
      const tx = db.transaction('memories', 'readwrite');
      const store = tx.objectStore('memories');
      store.clear();
    }
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(`jadai_memories_${userId}`);
  } catch {
    // ignore
  }
}
