"use client";

import { useEffect } from "react";
import { PageBackground } from "@/components/layout/PageBackground";
import { LoadingButton } from "@/components/LoadingButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageBackground>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="section-tag">[ Erro ]</p>
        <h1 className="text-title-gradient mt-4 text-3xl font-black">
          Algo deu errado
        </h1>
        <p className="mt-4 max-w-md text-zinc-400">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <LoadingButton type="button" className="mt-8" onClick={reset}>
          Tentar novamente
        </LoadingButton>
      </div>
    </PageBackground>
  );
}
