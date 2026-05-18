import { promises as fs } from "fs";
import path from "path";
import type { AgendamentoLink, Bloqueio } from "./types";

export interface DB {
  links: AgendamentoLink[];
  bloqueios: Bloqueio[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const LEGACY_FILE = path.join(DATA_DIR, "links.json");

let writeQueue: Promise<void> = Promise.resolve();

export function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function migrateFromLegacy(): Promise<DB | null> {
  try {
    await fs.access(LEGACY_FILE);
  } catch {
    return null;
  }

  const raw = await fs.readFile(LEGACY_FILE, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  let links: AgendamentoLink[];
  if (Array.isArray(parsed)) {
    links = parsed as AgendamentoLink[];
  } else if (
    parsed &&
    typeof parsed === "object" &&
    "links" in parsed &&
    Array.isArray((parsed as DB).links)
  ) {
    links = (parsed as DB).links;
  } else {
    links = [];
  }

  const db: DB = { links, bloqueios: [] };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(LEGACY_FILE, `${LEGACY_FILE}.bak`);

  return db;
}

export async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
    return;
  } catch {
    // continue
  }

  const migrated = await migrateFromLegacy();
  if (migrated) return;

  await fs.writeFile(
    DB_FILE,
    JSON.stringify({ links: [], bloqueios: [] } satisfies DB, null, 2),
    "utf-8"
  );
}

export async function readDB(): Promise<DB> {
  await ensureDataFile();
  const raw = await fs.readFile(DB_FILE, "utf-8");
  const parsed = JSON.parse(raw) as DB;
  return {
    links: parsed.links ?? [],
    bloqueios: parsed.bloqueios ?? [],
  };
}

export async function writeDB(db: DB): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}
