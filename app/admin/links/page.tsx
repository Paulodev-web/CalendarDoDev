"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { LinkCard } from "@/components/LinkCard";
import { LoadingButton } from "@/components/LoadingButton";
import { NeonDot } from "@/components/ui/NeonDot";
import type { AgendamentoLink } from "@/lib/types";

export default function AdminPage() {
  const [links, setLinks] = useState<AgendamentoLink[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function handleToggle(id: string) {
    const res = await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle" }),
    });
    if (!res.ok) throw new Error("Falha ao alternar status");
    await loadLinks();
  }

  return (
    <AdminShell title="Painel Admin">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title-gradient text-3xl font-black tracking-tight md:text-4xl">
            Links de agendamento
          </h1>
          <p className="mt-2 text-zinc-400">
            Crie e compartilhe links para seus clientes agendarem reuniões.
          </p>
        </div>
        <Link href="/admin/links/novo">
          <LoadingButton type="button" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo link
          </LoadingButton>
        </Link>
      </div>

      <NeonDot />

      {loading ? (
        <p className="text-center text-zinc-500">Carregando...</p>
      ) : links.length === 0 ? (
        <div className="card-dark rounded-xl border border-dashed border-neon-green/30 p-12 text-center">
          <p className="text-zinc-400">Nenhum link criado ainda.</p>
          <Link href="/admin/links/novo" className="mt-4 inline-block text-neon-green hover:underline">
            Criar primeiro link
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
