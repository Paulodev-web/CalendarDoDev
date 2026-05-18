import { z } from "zod";
import { DURACOES } from "./types";

const horarioRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dataRegex = /^\d{4}-\d{2}-\d{2}$/;

export const slotDisponivelSchema = z.object({
  data: z.string().regex(dataRegex, "Data inválida (YYYY-MM-DD)"),
  horarios: z
    .array(z.string().regex(horarioRegex, "Horário inválido (HH:mm)"))
    .min(1, "Adicione pelo menos um horário por dia"),
});

export const createLinkSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(200),
  descricao: z.string().max(2000).optional(),
  duracao: z
    .number()
    .refine((v) => (DURACOES as readonly number[]).includes(v), {
      message: "Duração inválida",
    }),
  slots: z.array(slotDisponivelSchema).min(1, "Configure pelo menos um dia"),
});

export const updateLinkSchema = createLinkSchema.extend({
  ativo: z.boolean().optional(),
});

export const agendarSchema = z.object({
  linkId: z.string().min(1),
  data: z.string().regex(dataRegex),
  horario: z.string().regex(horarioRegex),
  nomeCliente: z.string().min(2, "Nome é obrigatório").max(200),
  emailCliente: z.string().email("Email inválido"),
});

export type CreateLinkBody = z.infer<typeof createLinkSchema>;
export type UpdateLinkBody = z.infer<typeof updateLinkSchema>;
export type AgendarBody = z.infer<typeof agendarSchema>;
