import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getBloqueios } from "@/lib/bloqueios";
import { addAgendamento, getLinkById } from "@/lib/links";
import { agendarSchema } from "@/lib/schemas";
import { isSlotAvailable, slotColideComBloqueio } from "@/lib/slots";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = agendarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { linkId, data, horario, nomeCliente, emailCliente } = parsed.data;

    const link = await getLinkById(linkId);
    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    if (!link.ativo) {
      return NextResponse.json(
        { error: "Este link não está aceitando agendamentos" },
        { status: 400 }
      );
    }

    if (!isSlotAvailable(link, data, horario)) {
      return NextResponse.json(
        { error: "Este horário não está mais disponível" },
        { status: 409 }
      );
    }

    const bloqueios = await getBloqueios();
    if (slotColideComBloqueio(data, horario, link.duracao, bloqueios)) {
      return NextResponse.json(
        { error: "Este horário está bloqueado" },
        { status: 409 }
      );
    }

    const linkRecheck = await getLinkById(linkId);
    const bloqueiosRecheck = await getBloqueios();
    if (!linkRecheck || !linkRecheck.ativo) {
      return NextResponse.json(
        { error: "Este link não está aceitando agendamentos" },
        { status: 400 }
      );
    }
    if (!isSlotAvailable(linkRecheck, data, horario)) {
      return NextResponse.json(
        { error: "Este horário foi reservado por outra pessoa" },
        { status: 409 }
      );
    }
    if (slotColideComBloqueio(data, horario, linkRecheck.duracao, bloqueiosRecheck)) {
      return NextResponse.json(
        { error: "Este horário está bloqueado" },
        { status: 409 }
      );
    }

    const agendamento = {
      id: nanoid(10),
      nomeCliente,
      emailCliente,
      data,
      horario,
      agendadoEm: new Date().toISOString(),
    };

    const result = await addAgendamento(linkId, agendamento);
    if (!result.ok) {
      if (result.reason === "slot_taken") {
        return NextResponse.json(
          { error: "Este horário foi reservado por outra pessoa" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agendamento,
    });
  } catch (error) {
    console.error("[POST /api/agendar]", error);
    return NextResponse.json(
      { error: "Erro interno ao processar agendamento" },
      { status: 500 }
    );
  }
}
