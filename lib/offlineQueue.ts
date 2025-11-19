import { openDB } from "idb";

const DB_NAME = "analytics-queue";
const STORE_NAME = "pending";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    },
  });
}

export async function addToQueue(item: any) {
  const db = await getDB();
  await db.add(STORE_NAME, item);
}

export async function getQueue(): Promise<any[]> {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) || [];
}

export async function removeFromQueue(key: number) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}

export async function clearQueue() {
  const db = await getDB();
  const keys = await db.getAllKeys(STORE_NAME);
  for (const key of keys) {
    await db.delete(STORE_NAME, key);
  }
}
