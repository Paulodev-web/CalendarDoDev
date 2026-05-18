"use client";

import Link from "next/link";
import { PageBackground } from "@/components/layout/PageBackground";

export default function AgendarError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageBackground>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Erro ao carregar</h1>
        <p className="mt-2 text-zinc-500">
          Não foi possível exibir a página de agendamento.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="text-neon-green hover:underline"
          >
            Tentar novamente
          </button>
          <Link href="/" className="text-zinc-500 hover:text-white">
            Início
          </Link>
        </div>
      </div>
    </PageBackground>
  );
}
