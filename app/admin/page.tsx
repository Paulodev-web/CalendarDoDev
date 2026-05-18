"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import {
  AgendaCalendar,
  type AgendamentoComLink,
} from "@/components/AgendaCalendar";
import { LoadingButton } from "@/components/LoadingButton";
import { NeonDot } from "@/components/ui/NeonDot";
import type { AgendamentoLink, Bloqueio } from "@/lib/types";

export default function AdminAgendaPage() {
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoComLink[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [bloqueiosRes, linksRes] = await Promise.all([
      fetch("/api/bloqueios"),
      fetch("/api/links"),
    ]);
    const bloqueiosData = await bloqueiosRes.json();
    const linksData: AgendamentoLink[] = await linksRes.json();

    setBloqueios(bloqueiosData);
    setAgendamentos(
      linksData.flatMap((link) =>
        link.agendamentos.map((a) => ({
          ...a,
          linkTitulo: link.titulo,
          duracao: link.duracao,
        }))
      )
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AdminShell title="Agenda">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title-gradient text-3xl font-black tracking-tight md:text-4xl">
            Agenda
          </h1>
          <p className="mt-2 text-zinc-300">
            Bloqueios e agendamentos recebidos dos clientes.
          </p>
        </div>
        <Link href="/admin/links">
          <LoadingButton
            type="button"
            className="w-full border border-neon-green/30 bg-transparent sm:w-auto hover:bg-neon-green/10"
          >
            <Link2 className="mr-2 h-4 w-4" />
            Gerenciar Links
          </LoadingButton>
        </Link>
      </div>

      <NeonDot />

      {loading ? (
        <p className="text-center text-zinc-500">Carregando...</p>
      ) : (
        <AgendaCalendar
          bloqueios={bloqueios}
          agendamentos={agendamentos}
          onBloqueioCreated={(b) => setBloqueios((prev) => [...prev, b])}
          onBloqueioDeleted={(id) =>
            setBloqueios((prev) => prev.filter((b) => b.id !== id))
          }
        />
      )}
    </AdminShell>
  );
}
