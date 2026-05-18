import type {
  Agendamento,
  AgendamentoLink,
  Bloqueio,
  SlotDisponivel,
} from "@/lib/types";

export type LinkRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  duracao: number;
  slots: SlotDisponivel[] | unknown;
  ativo: boolean;
  criado_em: string;
};

export type AgendamentoRow = {
  id: string;
  link_id: string;
  nome_cliente: string;
  email_cliente: string;
  data: string;
  horario: string;
  agendado_em: string;
};

export type BloqueioRow = {
  id: string;
  titulo: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  criado_em: string;
};

function parseSlots(slots: unknown): SlotDisponivel[] {
  if (!Array.isArray(slots)) return [];
  return slots as SlotDisponivel[];
}

export function rowToAgendamento(row: AgendamentoRow): Agendamento {
  return {
    id: row.id,
    nomeCliente: row.nome_cliente,
    emailCliente: row.email_cliente,
    data: row.data,
    horario: row.horario,
    agendadoEm: row.agendado_em,
  };
}

export function rowToBloqueio(row: BloqueioRow): Bloqueio {
  return {
    id: row.id,
    titulo: row.titulo,
    data: row.data,
    horarioInicio: row.horario_inicio,
    horarioFim: row.horario_fim,
    criadoEm: row.criado_em,
  };
}

export function rowToLink(
  row: LinkRow,
  agendamentos: AgendamentoRow[] = []
): AgendamentoLink {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao ?? undefined,
    duracao: row.duracao,
    slots: parseSlots(row.slots),
    ativo: row.ativo,
    criadoEm: row.criado_em,
    agendamentos: agendamentos.map(rowToAgendamento),
  };
}

export function agendamentoToRow(
  linkId: string,
  agendamento: Agendamento
): AgendamentoRow {
  return {
    id: agendamento.id,
    link_id: linkId,
    nome_cliente: agendamento.nomeCliente,
    email_cliente: agendamento.emailCliente,
    data: agendamento.data,
    horario: agendamento.horario,
    agendado_em: agendamento.agendadoEm,
  };
}

export function bloqueioToInsert(
  bloqueio: Omit<Bloqueio, "id" | "criadoEm"> & { id: string; criadoEm: string }
) {
  return {
    id: bloqueio.id,
    titulo: bloqueio.titulo,
    data: bloqueio.data,
    horario_inicio: bloqueio.horarioInicio,
    horario_fim: bloqueio.horarioFim,
    criado_em: bloqueio.criadoEm,
  };
}
