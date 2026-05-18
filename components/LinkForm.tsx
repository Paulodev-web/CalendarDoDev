"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SlotBuilder } from "@/components/SlotBuilder";
import { LoadingButton } from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgendamentoLink, SlotDisponivel } from "@/lib/types";
import { DURACOES, duracaoLabel } from "@/lib/types";

interface LinkFormProps {
  mode: "create" | "edit";
  initial?: AgendamentoLink;
}

export function LinkForm({ mode, initial }: LinkFormProps) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [duracao, setDuracao] = useState(String(initial?.duracao ?? 60));
  const [slots, setSlots] = useState<SlotDisponivel[]>(initial?.slots ?? []);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      titulo,
      descricao: descricao || undefined,
      duracao: Number(duracao),
      slots,
    };

    try {
      const url =
        mode === "create" ? "/api/links" : `/api/links/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao salvar");
      }

      toast.success(mode === "create" ? "Link criado!" : "Link atualizado!");
      router.push("/admin/links");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <p className="section-tag">[ Informações básicas ]</p>
        <div className="space-y-2">
          <Label htmlFor="titulo" className="text-zinc-200">
            Título da reunião
          </Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="field-surface"
            placeholder="Reunião de Kickoff"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao" className="text-zinc-200">
            Descrição (opcional)
          </Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="field-surface min-h-[100px]"
            placeholder="Texto exibido para o cliente..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-200">Duração</Label>
          <Select
            value={duracao}
            onValueChange={(v) => v && setDuracao(v)}
          >
            <SelectTrigger className="field-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURACOES.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {duracaoLabel(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <p className="section-tag">[ Horários disponíveis ]</p>
        <p className="text-sm text-muted-ui">
          Clique em um dia no calendário para adicionar horários.
        </p>
        <SlotBuilder value={slots} onChange={setSlots} />
      </section>

      <LoadingButton type="submit" loading={loading} disabled={slots.length === 0}>
        {mode === "create" ? "Criar link" : "Salvar alterações"}
      </LoadingButton>
    </form>
  );
}
