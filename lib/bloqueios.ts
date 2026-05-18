import { nanoid } from "nanoid";
import { getSupabase } from "./supabase/server";
import { bloqueioToInsert, rowToBloqueio, type BloqueioRow } from "./supabase/mappers";
import type { Bloqueio } from "./types";

export async function getBloqueios(): Promise<Bloqueio[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bloqueios")
    .select("*")
    .order("data", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as BloqueioRow[]).map(rowToBloqueio);
}

export async function createBloqueio(
  data: Omit<Bloqueio, "id" | "criadoEm">
): Promise<Bloqueio> {
  const supabase = getSupabase();
  const bloqueio: Bloqueio = {
    id: nanoid(10),
    ...data,
    criadoEm: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("bloqueios")
    .insert(bloqueioToInsert(bloqueio));

  if (error) throw error;
  return bloqueio;
}

export async function deleteBloqueio(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bloqueios")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
