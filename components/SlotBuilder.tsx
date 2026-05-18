"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SlotDisponivel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SlotBuilderProps {
  value: SlotDisponivel[];
  onChange: (slots: SlotDisponivel[]) => void;
}

const horarioRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function SlotBuilder({ value, onChange }: SlotBuilderProps) {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newHorario, setNewHorario] = useState("09:00");
  const [error, setError] = useState("");

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const slotMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of value) map.set(s.data, [...s.horarios]);
    return map;
  }, [value]);

  function openDay(dateStr: string) {
    setSelectedDate(dateStr);
    setError("");
    setNewHorario("09:00");
  }

  function updateSlots(map: Map<string, string[]>) {
    const slots = Array.from(map.entries())
      .filter(([, h]) => h.length > 0)
      .map(([data, horarios]) => ({
        data,
        horarios: [...horarios].sort(),
      }))
      .sort((a, b) => a.data.localeCompare(b.data));
    onChange(slots);
  }

  function addHorario() {
    if (!selectedDate) return;
    if (!horarioRegex.test(newHorario)) {
      setError("Use o formato HH:mm (ex: 09:00)");
      return;
    }
    const map = new Map(slotMap);
    const current = map.get(selectedDate) ?? [];
    if (current.includes(newHorario)) {
      setError("Horário já adicionado");
      return;
    }
    map.set(selectedDate, [...current, newHorario].sort());
    updateSlots(map);
    setNewHorario("");
    setError("");
  }

  function removeHorario(horario: string) {
    if (!selectedDate) return;
    const map = new Map(slotMap);
    const current = (map.get(selectedDate) ?? []).filter((h) => h !== horario);
    if (current.length === 0) map.delete(selectedDate);
    else map.set(selectedDate, current);
    updateSlots(map);
  }

  function removeDay() {
    if (!selectedDate) return;
    const map = new Map(slotMap);
    map.delete(selectedDate);
    updateSlots(map);
    setSelectedDate(null);
  }

  const selectedHorarios = selectedDate ? (slotMap.get(selectedDate) ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMonth(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="font-mono text-sm uppercase tracking-wider text-neon-green">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-300">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const hasSlots = slotMap.has(dateStr);
          const inMonth = isSameMonth(day, month);
          const count = slotMap.get(dateStr)?.length ?? 0;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => openDay(dateStr)}
              className={cn(
                "relative aspect-square rounded-lg border text-sm transition-colors",
                inMonth ? "text-white" : "text-zinc-600",
                hasSlots
                  ? "border-neon-green/50 bg-neon-green/10"
                  : "border-zinc-600 bg-zinc-900/60 hover:border-neon-green/30"
              )}
            >
              {format(day, "d")}
              {count > 0 && (
                <span className="absolute bottom-1 right-1 text-[10px] text-neon-green">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <DialogContent className="border-border-dark bg-surface-dark">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDate &&
                format(
                  parse(selectedDate, "yyyy-MM-dd", new Date()),
                  "EEEE, d 'de' MMMM",
                  { locale: ptBR }
                )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="horario" className="text-zinc-400">
                  Novo horário
                </Label>
                <Input
                  id="horario"
                  value={newHorario}
                  onChange={(e) => setNewHorario(e.target.value)}
                  placeholder="09:00"
                  className="field-surface font-mono"
                />
              </div>
              <Button
                type="button"
                className="mt-6 btn-neon"
                onClick={addHorario}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="space-y-2">
              {selectedHorarios.length === 0 ? (
                <p className="text-sm text-muted-ui">Nenhum horário neste dia</p>
              ) : (
                selectedHorarios.map((h) => (
                  <div
                    key={h}
                    className="flex items-center justify-between rounded-lg border border-border-dark px-3 py-2"
                  >
                    <span className="font-mono text-neon-green">{h}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHorario(h)}
                    >
                      <X className="h-4 w-4 text-zinc-400" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {selectedHorarios.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeDay}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover dia inteiro
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
