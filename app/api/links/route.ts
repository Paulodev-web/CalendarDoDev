import { NextResponse } from "next/server";
import { createLink, getAllLinks } from "@/lib/links";
import { createLinkSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error("[GET /api/links]", error);
    return NextResponse.json(
      { error: "Erro ao carregar links" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const link = await createLink(parsed.data);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("[POST /api/links]", error);
    return NextResponse.json(
      { error: "Erro ao criar link" },
      { status: 500 }
    );
  }
}
