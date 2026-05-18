"use client";

import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import {
  formatDataLonga,
  formatDayMonth,
  formatWeekdayShort,
} from "@/lib/dates";
import { getAvailableSlotsByDay } from "@/lib/slots";
import type { Agendamento, SlotDisponivel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SlotPickerProps {
  slots: SlotDisponivel[];
  agendamentos: Agendamento[];
  duracao: number;
  onSelect: (data: string, horario: string) => void;
}

export function SlotPicker({
  slots,
  agendamentos,
  duracao,
  onSelect,
}: SlotPickerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const availableDays = getAvailableSlotsByDay({ slots, agendamentos });

  if (availableDays.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="section-tag">[ Escolha um horário ]</p>
      {availableDays.map((day) => {
        const isOpen = expanded === day.data;
        return (
          <div
            key={day.data}
            className="overflow-hidden rounded-xl border border-border-dark bg-surface-dark"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-neon-green/5"
              onClick={() => setExpanded(isOpen ? null : day.data)}
            >
              <div>
                <p className="font-bold capitalize text-white">
                  {formatWeekdayShort(day.data)}, {formatDayMonth(day.data)}
                </p>
                <p className="text-xs text-muted-ui">
                  {day.horarios.length} horário(s) · {duracao} min
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-neon-green transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="grid grid-cols-2 gap-2 border-t border-border-dark p-4 sm:grid-cols-3">
                {day.horarios.map((horario) => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => onSelect(day.data, horario)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-neon-green/30 py-3 font-mono text-sm text-neon-green transition-all hover:border-neon-green hover:bg-neon-green/10"
                  >
                    <Clock className="h-3 w-3" />
                    {horario}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SlotPickerSummary({ data }: { data: string }) {
  return (
    <p className="text-sm text-zinc-400">{formatDataLonga(data)}</p>
  );
}
