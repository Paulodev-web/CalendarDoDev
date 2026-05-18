"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { BloqueioModal } from "@/components/BloqueioModal";
import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDataLonga } from "@/lib/dates";
import type { Agendamento, Bloqueio } from "@/lib/types";
import { duracaoLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AgendamentoComLink = Agendamento & {
  linkTitulo: string;
  duracao: number;
};

interface AgendaCalendarProps {
  bloqueios: Bloqueio[];
  agendamentos: AgendamentoComLink[];
  onBloqueioCreated: (bloqueio: Bloqueio) => void;
  onBloqueioDeleted: (id: string) => void;
}

type SelectedItem =
  | { type: "bloqueio"; item: Bloqueio }
  | { type: "agendamento"; item: AgendamentoComLink };

export function AgendaCalendar({
  bloqueios,
  agendamentos,
  onBloqueioCreated,
  onBloqueioDeleted,
}: AgendaCalendarProps) {
  const [month, setMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string | undefined>();
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const bloqueiosByDate = useMemo(() => {
    const map = new Map<string, Bloqueio[]>();
    for (const b of bloqueios) {
      const list = map.get(b.data) ?? [];
      list.push(b);
      map.set(b.data, list);
    }
    return map;
  }, [bloqueios]);

  const agendamentosByDate = useMemo(() => {
    const map = new Map<string, AgendamentoComLink[]>();
    for (const a of agendamentos) {
      const list = map.get(a.data) ?? [];
      list.push(a);
      map.set(a.data, list);
    }
    return map;
  }, [agendamentos]);

  function openNewBloqueio(dateStr: string) {
    setModalDate(dateStr);
    setModalOpen(true);
  }

  function handleDayClick(dateStr: string) {
    const dayBloqueios = bloqueiosByDate.get(dateStr) ?? [];
    const dayAgendamentos = agendamentosByDate.get(dateStr) ?? [];
    if (dayBloqueios.length === 0 && dayAgendamentos.length === 0) {
      openNewBloqueio(dateStr);
    }
  }

  async function handleDeleteBloqueio() {
    if (!selected || selected.type !== "bloqueio") return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/bloqueios/${selected.item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onBloqueioDeleted(selected.item.id);
      setSelected(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMonth(subMonths(month, 1))}
          className="border-border-dark"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold capitalize text-white">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMonth(addMonths(month, 1))}
          className="border-border-dark"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-zinc-300">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const dayBloqueios = bloqueiosByDate.get(dateStr) ?? [];
          const dayAgendamentos = agendamentosByDate.get(dateStr) ?? [];
          const hasItems = dayBloqueios.length > 0 || dayAgendamentos.length > 0;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(dateStr)}
              className={cn(
                "min-h-[88px] rounded-lg border p-1 text-left transition-colors",
                inMonth
                  ? "border-zinc-600 bg-zinc-900/80 hover:border-neon-green/30"
                  : "border-transparent bg-black/20 opacity-40",
                !hasItems && inMonth && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "mb-1 block text-xs font-mono",
                  inMonth ? "text-zinc-200" : "text-zinc-600"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-0.5">
                {dayBloqueios.map((b) => (
                  <span
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({ type: "bloqueio", item: b });
                    }}
                    className="block truncate rounded px-1 py-0.5 text-[10px] bg-zinc-600 text-zinc-100"
                    title={b.titulo}
                  >
                    {b.titulo}
                  </span>
                ))}
                {dayAgendamentos.map((a) => (
                  <span
                    key={a.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({ type: "agendamento", item: a });
                    }}
                    className="block truncate rounded px-1 py-0.5 text-[10px] bg-neon-green/20 text-neon-green"
                    title={a.nomeCliente}
                  >
                    {a.horario} {a.nomeCliente}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-muted-ui">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-zinc-600" /> Bloqueio
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-neon-green/60" /> Agendamento
        </span>
      </div>

      <BloqueioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onBloqueioCreated}
        dataPreSelecionada={modalDate}
      />

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="border-border-dark bg-surface-dark sm:max-w-md">
          {selected?.type === "bloqueio" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selected.item.titulo}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-zinc-300">
                {formatDataLonga(selected.item.data)}
              </p>
              <p className="font-mono text-neon-green">
                {selected.item.horarioInicio} – {selected.item.horarioFim}
              </p>
              <LoadingButton
                type="button"
                loading={deleting}
                className="mt-4 w-full bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDeleteBloqueio}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir bloqueio
              </LoadingButton>
            </>
          )}
          {selected?.type === "agendamento" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selected.item.nomeCliente}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-zinc-300">{selected.item.emailCliente}</p>
              <p className="mt-2 text-sm text-muted-ui">{selected.item.linkTitulo}</p>
              <p className="mt-2 font-mono text-neon-green">
                {formatDataLonga(selected.item.data)} às {selected.item.horario}
              </p>
              <p className="text-sm text-muted-ui">
                Duração: {duracaoLabel(selected.item.duracao)}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
