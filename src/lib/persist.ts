import type { StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();

function lsGet(name: string): string | null {
  try {
    return localStorage.getItem(name);
  } catch {
    return memory.get(name) ?? null;
  }
}

function lsSet(name: string, value: string) {
  try {
    localStorage.setItem(name, value);
  } catch {
    memory.set(name, value);
  }
}

function lsDel(name: string) {
  try {
    localStorage.removeItem(name);
  } catch {
    memory.delete(name);
  }
}

function idb(): Promise<IDBDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("healthie-lab", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(name: string): Promise<string | null> {
  const open = idb();
  if (!open) return null;
  try {
    const db = await open;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readonly");
      const req = tx.objectStore("kv").get(name);
      req.onsuccess = () => resolve(typeof req.result === "string" ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbPut(name: string, value: string | null): Promise<void> {
  const open = idb();
  if (!open) return;
  try {
    const db = await open;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("kv", "readwrite");
      const store = tx.objectStore("kv");
      const req = value == null ? store.delete(name) : store.put(value, name);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* private mode */
  }
}

/** localStorage first (sync), IndexedDB copy so a Safari wipe of one store doesn’t always empty You. */
export const labStorage: StateStorage = {
  getItem: (name) => {
    const local = lsGet(name);
    if (local != null) return local;
    void idbGet(name).then((v) => {
      if (v != null && lsGet(name) == null) lsSet(name, v);
    });
    return null;
  },
  setItem: (name, value) => {
    lsSet(name, value);
    void idbPut(name, value);
  },
  removeItem: (name) => {
    lsDel(name);
    void idbPut(name, null);
  },
};

export async function wipeLabStores(): Promise<void> {
  for (const name of ["healthie-prefs", "healthie-history"]) {
    lsDel(name);
    void idbPut(name, null);
  }
}
