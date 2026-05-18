import { NextResponse } from "next/server";
import { deleteBloqueio } from "@/lib/bloqueios";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ bloqueioId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { bloqueioId } = await context.params;
    const deleted = await deleteBloqueio(bloqueioId);

    if (!deleted) {
      return NextResponse.json({ error: "Bloqueio não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/bloqueios/:id]", error);
    return NextResponse.json(
      { error: "Erro ao excluir bloqueio" },
      { status: 500 }
    );
  }
}
