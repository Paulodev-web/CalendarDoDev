const BOOKING_KEY = "reunicheck_booking";

export interface BookingSession {
  nome: string;
  data: string;
  horario: string;
  duracao: number;
  titulo: string;
}

export function setBookingSession(data: BookingSession): void {
  sessionStorage.setItem(BOOKING_KEY, JSON.stringify(data));
}

export function getBookingSession(): BookingSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BOOKING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BookingSession;
  } catch {
    return null;
  }
}

export function clearBookingSession(): void {
  sessionStorage.removeItem(BOOKING_KEY);
}
