import { nanoid } from "nanoid";
import { isSlotAvailable } from "./slots";
import { getSupabase } from "./supabase/server";
import {
  agendamentoToRow,
  rowToLink,
  type AgendamentoRow,
  type LinkRow,
} from "./supabase/mappers";
import type {
  Agendamento,
  AgendamentoLink,
  CreateLinkInput,
  UpdateLinkInput,
} from "./types";

export { isSlotAvailable } from "./slots";

async function fetchAgendamentosByLinkIds(
  linkIds: string[]
): Promise<Map<string, AgendamentoRow[]>> {
  const map = new Map<string, AgendamentoRow[]>();
  if (linkIds.length === 0) return map;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .in("link_id", linkIds);

  if (error) throw error;

  for (const row of (data ?? []) as AgendamentoRow[]) {
    const list = map.get(row.link_id) ?? [];
    list.push(row);
    map.set(row.link_id, list);
  }

  return map;
}

export async function getAllLinks(): Promise<AgendamentoLink[]> {
  const supabase = getSupabase();
  const { data: links, error } = await supabase.from("links").select("*");

  if (error) throw error;

  const rows = (links ?? []) as LinkRow[];
  const agendamentosMap = await fetchAgendamentosByLinkIds(
    rows.map((l) => l.id)
  );

  return rows.map((row) =>
    rowToLink(row, agendamentosMap.get(row.id) ?? [])
  );
}

export async function getLinkById(id: string): Promise<AgendamentoLink | null> {
  const supabase = getSupabase();
  const { data: link, error } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!link) return null;

  const { data: agendamentos, error: agError } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("link_id", id);

  if (agError) throw agError;

  return rowToLink(link as LinkRow, (agendamentos ?? []) as AgendamentoRow[]);
}

export async function createLink(
  input: CreateLinkInput
): Promise<AgendamentoLink> {
  const supabase = getSupabase();
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

  const { error } = await supabase.from("links").insert({
    id: link.id,
    titulo: link.titulo,
    descricao: link.descricao ?? null,
    duracao: link.duracao,
    slots: link.slots,
    ativo: link.ativo,
    criado_em: link.criadoEm,
  });

  if (error) throw error;
  return link;
}

export async function updateLink(
  id: string,
  input: UpdateLinkInput
): Promise<AgendamentoLink | null> {
  const existing = await getLinkById(id);
  if (!existing) return null;

  const supabase = getSupabase();
  const { error } = await supabase
    .from("links")
    .update({
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      duracao: input.duracao,
      slots: input.slots,
      ativo: input.ativo ?? existing.ativo,
    })
    .eq("id", id);

  if (error) throw error;
  return getLinkById(id);
}

export async function deleteLink(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function toggleLinkActive(
  id: string
): Promise<AgendamentoLink | null> {
  const existing = await getLinkById(id);
  if (!existing) return null;

  const supabase = getSupabase();
  const { error } = await supabase
    .from("links")
    .update({ ativo: !existing.ativo })
    .eq("id", id);

  if (error) throw error;
  return getLinkById(id);
}

export async function addAgendamento(
  linkId: string,
  agendamento: Agendamento
): Promise<{ ok: true; link: AgendamentoLink } | { ok: false; reason: string }> {
  const link = await getLinkById(linkId);
  if (!link) return { ok: false, reason: "not_found" };
  if (!link.ativo) return { ok: false, reason: "inactive" };
  if (!isSlotAvailable(link, agendamento.data, agendamento.horario)) {
    return { ok: false, reason: "slot_taken" };
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("agendamentos")
    .insert(agendamentoToRow(linkId, agendamento));

  if (error) {
    if (error.code === "23505") {
      return { ok: false, reason: "slot_taken" };
    }
    throw error;
  }

  const updated = await getLinkById(linkId);
  if (!updated) return { ok: false, reason: "not_found" };
  return { ok: true, link: updated };
}
