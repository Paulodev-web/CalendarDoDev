import { NextResponse } from "next/server";
import { createBloqueio, getBloqueios } from "@/lib/bloqueios";

export const runtime = "nodejs";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

function validateBloqueioBody(body: unknown): {
  ok: true;
  data: { titulo: string; data: string; horarioInicio: string; horarioFim: string };
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body inválido" };
  }

  const { titulo, data, horarioInicio, horarioFim } = body as Record<string, unknown>;

  if (typeof titulo !== "string" || titulo.trim().length === 0) {
    return { ok: false, error: "Título é obrigatório" };
  }
  if (typeof data !== "string" || !dateRegex.test(data)) {
    return { ok: false, error: "Data inválida (use YYYY-MM-DD)" };
  }
  if (typeof horarioInicio !== "string" || !timeRegex.test(horarioInicio)) {
    return { ok: false, error: "Horário de início inválido (use HH:mm)" };
  }
  if (typeof horarioFim !== "string" || !timeRegex.test(horarioFim)) {
    return { ok: false, error: "Horário de fim inválido (use HH:mm)" };
  }

  const inicio = parseInt(horarioInicio.replace(":", ""), 10);
  const fim = parseInt(horarioFim.replace(":", ""), 10);
  if (inicio >= fim) {
    return { ok: false, error: "Horário de início deve ser anterior ao de fim" };
  }

  return {
    ok: true,
    data: {
      titulo: titulo.trim(),
      data,
      horarioInicio,
      horarioFim,
    },
  };
}

export async function GET() {
  try {
    const bloqueios = await getBloqueios();
    return NextResponse.json(bloqueios);
  } catch (error) {
    console.error("[GET /api/bloqueios]", error);
    return NextResponse.json(
      { error: "Erro ao carregar bloqueios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateBloqueioBody(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const bloqueio = await createBloqueio(parsed.data);
    return NextResponse.json(bloqueio, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bloqueios]", error);
    return NextResponse.json(
      { error: "Erro ao criar bloqueio" },
      { status: 500 }
    );
  }
}
