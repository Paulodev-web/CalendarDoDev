import { addMinutes, format, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export const TIMEZONE = "America/Sao_Paulo";

export function formatDataLonga(data: string): string {
  const d = parse(data, "yyyy-MM-dd", new Date());
  return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDataCurta(data: string): string {
  const d = parse(data, "yyyy-MM-dd", new Date());
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatHorarioUI(horario: string): string {
  return horario;
}

export function buildDateTimeRange(
  data: string,
  horario: string,
  duracaoMin: number
): { dataInicio: string; dataFim: string } {
  const localStart = `${data}T${horario}:00`;
  const startUtc = fromZonedTime(localStart, TIMEZONE);
  const endUtc = addMinutes(startUtc, duracaoMin);

  return {
    dataInicio: formatInTimeZone(startUtc, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    dataFim: formatInTimeZone(endUtc, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  };
}

export function isSlotInPast(data: string, horario: string): boolean {
  const localStart = `${data}T${horario}:00`;
  const startUtc = fromZonedTime(localStart, TIMEZONE);
  return startUtc.getTime() < Date.now();
}

export function formatWeekdayShort(data: string): string {
  const d = parse(data, "yyyy-MM-dd", new Date());
  return format(d, "EEE", { locale: ptBR });
}

export function formatDayMonth(data: string): string {
  const d = parse(data, "yyyy-MM-dd", new Date());
  return format(d, "d 'de' MMM", { locale: ptBR });
}
