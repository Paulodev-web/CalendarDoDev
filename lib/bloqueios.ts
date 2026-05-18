import { nanoid } from "nanoid";
import { readDB, withWriteLock, writeDB } from "./db";
import type { Bloqueio } from "./types";

export async function getBloqueios(): Promise<Bloqueio[]> {
  const db = await readDB();
  return db.bloqueios;
}

export async function createBloqueio(
  data: Omit<Bloqueio, "id" | "criadoEm">
): Promise<Bloqueio> {
  return withWriteLock(async () => {
    const db = await readDB();
    const bloqueio: Bloqueio = {
      id: nanoid(10),
      ...data,
      criadoEm: new Date().toISOString(),
    };
    db.bloqueios.push(bloqueio);
    await writeDB(db);
    return bloqueio;
  });
}

export async function deleteBloqueio(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const db = await readDB();
    const filtered = db.bloqueios.filter((b) => b.id !== id);
    if (filtered.length === db.bloqueios.length) return false;
    db.bloqueios = filtered;
    await writeDB(db);
    return true;
  });
}
