import { nanoid } from "nanoid";
import { readDB, withWriteLock, writeDB } from "./db";
import { isSlotAvailable } from "./slots";
import type {
  Agendamento,
  AgendamentoLink,
  CreateLinkInput,
  UpdateLinkInput,
} from "./types";

export { isSlotAvailable } from "./slots";

export async function getAllLinks(): Promise<AgendamentoLink[]> {
  const db = await readDB();
  return db.links;
}

export async function getLinkById(id: string): Promise<AgendamentoLink | null> {
  const db = await readDB();
  return db.links.find((l) => l.id === id) ?? null;
}

export async function createLink(
  input: CreateLinkInput
): Promise<AgendamentoLink> {
  return withWriteLock(async () => {
    const db = await readDB();
    const link: AgendamentoLink = {
      id: nanoid(10),
      titulo: input.titulo,
      descricao: input.descricao,
      duracao: input.duracao,
      slots: input.slots,
      ativo: true,
      criadoEm: new Date().toISOString(),
      agendamentos: [],
    };
    db.links.push(link);
    await writeDB(db);
    return link;
  });
}

export async function updateLink(
  id: string,
  input: UpdateLinkInput
): Promise<AgendamentoLink | null> {
  return withWriteLock(async () => {
    const db = await readDB();
    const index = db.links.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const existing = db.links[index];
    db.links[index] = {
      ...existing,
      titulo: input.titulo,
      descricao: input.descricao,
      duracao: input.duracao,
      slots: input.slots,
      ativo: input.ativo ?? existing.ativo,
    };
    await writeDB(db);
    return db.links[index];
  });
}

export async function deleteLink(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const db = await readDB();
    const filtered = db.links.filter((l) => l.id !== id);
    if (filtered.length === db.links.length) return false;
    db.links = filtered;
    await writeDB(db);
    return true;
  });
}

export async function toggleLinkActive(
  id: string
): Promise<AgendamentoLink | null> {
  return withWriteLock(async () => {
    const db = await readDB();
    const index = db.links.findIndex((l) => l.id === id);
    if (index === -1) return null;
    db.links[index].ativo = !db.links[index].ativo;
    await writeDB(db);
    return db.links[index];
  });
}

export async function addAgendamento(
  linkId: string,
  agendamento: Agendamento
): Promise<{ ok: true; link: AgendamentoLink } | { ok: false; reason: string }> {
  return withWriteLock(async () => {
    const db = await readDB();
    const index = db.links.findIndex((l) => l.id === linkId);
    if (index === -1) return { ok: false, reason: "not_found" };

    const link = db.links[index];
    if (!link.ativo) return { ok: false, reason: "inactive" };
    if (!isSlotAvailable(link, agendamento.data, agendamento.horario)) {
      return { ok: false, reason: "slot_taken" };
    }

    link.agendamentos.push(agendamento);
    await writeDB(db);
    return { ok: true, link };
  });
}
