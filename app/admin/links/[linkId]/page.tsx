"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { LinkForm } from "@/components/LinkForm";
import { LoadingButton } from "@/components/LoadingButton";
import { NeonDot } from "@/components/ui/NeonDot";
import { formatDataLonga } from "@/lib/dates";
import type { AgendamentoLink } from "@/lib/types";

export default function EditLinkPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;
  const [link, setLink] = useState<AgendamentoLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/links/${linkId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLink(data);
      })
      .catch(() => toast.error("Link não encontrado"))
      .finally(() => setLoading(false));
  }, [linkId]);

  async function handleDelete() {
    if (!confirm("Excluir este link permanentemente?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Link excluído");
      router.push("/admin/links");
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Detalhes">
        <p className="text-zinc-500">Carregando...</p>
      </AdminShell>
    );
  }

  if (!link) {
    return (
      <AdminShell title="Detalhes">
        <p className="text-zinc-500">Link não encontrado.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Editar link">
      <h1 className="text-title-gradient mb-2 text-3xl font-black">{link.titulo}</h1>
      <p className="mb-8 text-sm text-zinc-500">ID: {link.id}</p>

      <LinkForm mode="edit" initial={link} />

      <NeonDot />

      <section className="mt-8 space-y-4">
        <p className="section-tag">[ Agendamentos ]</p>
        {link.agendamentos.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum agendamento ainda.</p>
        ) : (
          <ul className="space-y-2">
            {link.agendamentos.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-border-dark bg-surface-dark px-4 py-3 text-sm"
              >
                <p className="font-medium text-white">{a.nomeCliente}</p>
                <p className="text-zinc-500">{a.emailCliente}</p>
                <p className="mt-1 font-mono text-neon-green">
                  {formatDataLonga(a.data)} às {a.horario}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 border-t border-border-dark pt-8">
        <LoadingButton
          type="button"
          loading={deleting}
          className="bg-destructive text-white hover:bg-destructive/90"
          onClick={handleDelete}
        >
          Excluir link
        </LoadingButton>
      </div>
    </AdminShell>
  );
}
