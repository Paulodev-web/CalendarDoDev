"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/LoadingButton";
import type { Bloqueio } from "@/lib/types";

interface BloqueioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bloqueio: Bloqueio) => void;
  dataPreSelecionada?: string;
}

export function BloqueioModal({
  open,
  onClose,
  onSave,
  dataPreSelecionada,
}: BloqueioModalProps) {
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("09:00");
  const [horarioFim, setHorarioFim] = useState("10:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitulo("");
      setData(dataPreSelecionada ?? "");
      setHorarioInicio("09:00");
      setHorarioFim("10:00");
      setError("");
    }
  }, [open, dataPreSelecionada]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!titulo.trim()) {
      setError("Informe um título");
      return;
    }
    if (!data) {
      setError("Informe a data");
      return;
    }
    if (horarioInicio >= horarioFim) {
      setError("Horário de início deve ser anterior ao de fim");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bloqueios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          data,
          horarioInicio,
          horarioFim,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Erro ao salvar");
      onSave(result as Bloqueio);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-border-dark bg-surface-dark sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Novo bloqueio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bloqueio-titulo" className="text-zinc-200">
              Título
            </Label>
            <Input
              id="bloqueio-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Call interno"
              className="field-surface"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloqueio-data" className="text-zinc-200">
              Data
            </Label>
            <Input
              id="bloqueio-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="field-surface"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloqueio-inicio" className="text-zinc-200">
              Horário início
            </Label>
            <Input
              id="bloqueio-inicio"
              type="time"
              value={horarioInicio}
              onChange={(e) => setHorarioInicio(e.target.value)}
              className="field-surface"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloqueio-fim" className="text-zinc-200">
              Horário fim
            </Label>
            <Input
              id="bloqueio-fim"
              type="time"
              value={horarioFim}
              onChange={(e) => setHorarioFim(e.target.value)}
              className="field-surface"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <LoadingButton type="submit" loading={loading} className="w-full">
            Salvar bloqueio
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
