import type { AgendamentoLink, Bloqueio, SlotDisponivel } from "./types";
import { isSlotInPast } from "./dates";

export type SlotCheckInput = Pick<AgendamentoLink, "slots" | "agendamentos">;

export type SlotFilterInput = Pick<
  AgendamentoLink,
  "slots" | "agendamentos" | "duracao"
>;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function slotColideComBloqueio(
  data: string,
  horario: string,
  duracao: number,
  bloqueios: Bloqueio[]
): boolean {
  const inicioA = toMinutes(horario);
  const fimA = inicioA + duracao;

  return bloqueios
    .filter((b) => b.data === data)
    .some((b) => {
      const inicioB = toMinutes(b.horarioInicio);
      const fimB = toMinutes(b.horarioFim);
      return inicioA < fimB && fimA > inicioB;
    });
}

export function isSlotAvailable(
  link: SlotCheckInput,
  data: string,
  horario: string
): boolean {
  const slotDay = link.slots.find((s) => s.data === data);
  if (!slotDay?.horarios.includes(horario)) return false;
  if (isSlotInPast(data, horario)) return false;
  return !link.agendamentos.some(
    (a) => a.data === data && a.horario === horario
  );
}

export function filtrarSlotsDisponiveis(
  link: SlotFilterInput,
  bloqueios: Bloqueio[]
): SlotDisponivel[] {
  return link.slots
    .map((slot) => ({
      data: slot.data,
      horarios: slot.horarios.filter(
        (h) =>
          isSlotAvailable(link, slot.data, h) &&
          !slotColideComBloqueio(slot.data, h, link.duracao, bloqueios)
      ),
    }))
    .filter((s) => s.horarios.length > 0)
    .sort((a, b) => a.data.localeCompare(b.data));
}

export function countAvailableSlots(
  link: SlotFilterInput,
  bloqueios: Bloqueio[] = []
): number {
  return filtrarSlotsDisponiveis(link, bloqueios).reduce(
    (sum, s) => sum + s.horarios.length,
    0
  );
}

export function getAvailableSlotsByDay(link: SlotCheckInput): {
  data: string;
  horarios: string[];
}[] {
  return link.slots
    .map((slot) => ({
      data: slot.data,
      horarios: slot.horarios.filter((h) =>
        isSlotAvailable(link, slot.data, h)
      ),
    }))
    .filter((s) => s.horarios.length > 0)
    .sort((a, b) => a.data.localeCompare(b.data));
}
