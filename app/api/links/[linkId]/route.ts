import { NextResponse } from "next/server";
import { getBloqueios } from "@/lib/bloqueios";
import {
  deleteLink,
  getLinkById,
  toggleLinkActive,
  updateLink,
} from "@/lib/links";
import { updateLinkSchema } from "@/lib/schemas";
import { filtrarSlotsDisponiveis } from "@/lib/slots";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ linkId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { linkId } = await context.params;
    const link = await getLinkById(linkId);

    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    const publico =
      new URL(request.url).searchParams.get("publico") === "true";

    if (publico) {
      const bloqueios = await getBloqueios();
      return NextResponse.json({
        ...link,
        slots: filtrarSlotsDisponiveis(link, bloqueios),
        agendamentos: [],
      });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("[GET /api/links/:id]", error);
    return NextResponse.json(
      { error: "Erro ao carregar link" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { linkId } = await context.params;
    const existing = await getLinkById(linkId);

    if (!existing) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const link = await updateLink(linkId, parsed.data);
    return NextResponse.json(link);
  } catch (error) {
    console.error("[PUT /api/links/:id]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar link" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { linkId } = await context.params;
    const body = await request.json();

    if (body?.action !== "toggle") {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const link = await toggleLinkActive(linkId);
    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("[PATCH /api/links/:id]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { linkId } = await context.params;
    const deleted = await deleteLink(linkId);

    if (!deleted) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/links/:id]", error);
    return NextResponse.json(
      { error: "Erro ao excluir link" },
      { status: 500 }
    );
  }
}
