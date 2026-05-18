"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgendarUrl } from "@/lib/config";
import type { AgendamentoLink } from "@/lib/types";
import { duracaoLabel } from "@/lib/types";
import { countAvailableSlots } from "@/lib/slots";

interface LinkCardProps {
  link: AgendamentoLink;
  onToggle: (id: string) => Promise<void>;
}

export function LinkCard({ link, onToggle }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const url = getAgendarUrl(link.id);
  const slotsDisponiveis = countAvailableSlots(link);
  const totalHorarios = link.slots.reduce((acc, s) => acc + s.horarios.length, 0);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggle() {
    setToggling(true);
    try {
      await onToggle(link.id);
      toast.success(link.ativo ? "Link desativado" : "Link ativado");
    } catch {
      toast.error("Erro ao alterar status");
    } finally {
      setToggling(false);
    }
  }

  return (
    <Card className="card-dark border-border-dark bg-surface-dark">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold text-white">
            {link.titulo}
          </CardTitle>
          <Badge
            variant={link.ativo ? "default" : "secondary"}
            className={
              link.ativo
                ? "bg-neon-green/20 text-neon-green"
                : "bg-zinc-800 text-zinc-400"
            }
          >
            {link.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">
          Duração: {duracaoLabel(link.duracao)} · {slotsDisponiveis}/
          {totalHorarios} horários livres · {link.agendamentos.length}{" "}
          agendamento(s)
        </p>

        <div className="flex items-center gap-2 rounded-lg border border-border-dark bg-black/50 px-3 py-2">
          <code className="flex-1 truncate text-xs text-zinc-500">{url}</code>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0 text-neon-green hover:bg-neon-green/10"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
            disabled={toggling}
            onClick={handleToggle}
          >
            <Power className="mr-1 h-3 w-3" />
            {link.ativo ? "Desativar" : "Ativar"}
          </Button>
          <Link
            href={`/admin/links/${link.id}`}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-border-dark px-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ExternalLink className="h-3 w-3" />
            Detalhes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
