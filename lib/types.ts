export interface SlotDisponivel {
  data: string;
  horarios: string[];
}

export interface Agendamento {
  id: string;
  nomeCliente: string;
  emailCliente: string;
  data: string;
  horario: string;
  agendadoEm: string;
}

export interface Bloqueio {
  id: string;
  titulo: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  criadoEm: string;
}

export interface AgendamentoLink {
  id: string;
  titulo: string;
  descricao?: string;
  duracao: number;
  slots: SlotDisponivel[];
  ativo: boolean;
  criadoEm: string;
  agendamentos: Agendamento[];
}

export type CreateLinkInput = {
  titulo: string;
  descricao?: string;
  duracao: number;
  slots: SlotDisponivel[];
};

export type UpdateLinkInput = CreateLinkInput & {
  ativo?: boolean;
};

export const DURACOES = [30, 45, 60, 90, 120] as const;

export function duracaoLabel(minutos: number): string {
  const map: Record<number, string> = {
    30: "30 min",
    45: "45 min",
    60: "1 hora",
    90: "1h30",
    120: "2 horas",
  };
  return map[minutos] ?? `${minutos} min`;
}
