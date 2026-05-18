"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { PageBackground } from "@/components/layout/PageBackground";
import { ConfirmacaoForm } from "@/components/ConfirmacaoForm";
import { SlotPicker } from "@/components/SlotPicker";
import { NeonDot } from "@/components/ui/NeonDot";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { countAvailableSlots } from "@/lib/slots";
import type { AgendamentoLink } from "@/lib/types";
import { duracaoLabel } from "@/lib/types";
import { setBookingSession } from "@/lib/booking";
import { toast } from "sonner";

export default function AgendarPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;

  const [link, setLink] = useState<AgendamentoLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{
    data: string;
    horario: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/links/${linkId}?publico=true`)
      .then((res) => res.json())
      .then((data) => setLink(data.error ? null : data))
      .finally(() => setLoading(false));
  }, [linkId]);

  async function handleConfirm(nome: string, email: string) {
    if (!selected || !link) return;

    const res = await fetch("/api/agendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkId: link.id,
        data: selected.data,
        horario: selected.horario,
        nomeCliente: nome,
        emailCliente: email,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Erro ao agendar");
    }

    setBookingSession({
      nome,
      data: selected.data,
      horario: selected.horario,
      duracao: link.duracao,
      titulo: link.titulo,
    });

    toast.success("Agendamento confirmado!");
    router.push(`/agendar/${linkId}/confirmado`);
  }

  if (loading) {
    return (
      <PageBackground>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-ui">Carregando...</p>
        </div>
      </PageBackground>
    );
  }

  if (!link) {
    return (
      <PageBackground>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-white">Link não encontrado</h1>
          <p className="mt-2 text-muted-ui">
            Verifique se o endereço está correto.
          </p>
        </div>
      </PageBackground>
    );
  }

  if (!link.ativo) {
    return (
      <PageBackground>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="text-title-gradient text-2xl font-black">
            Link indisponível
          </h1>
          <p className="mt-4 text-zinc-400">
            Este link de agendamento não está mais disponível.
          </p>
        </div>
      </PageBackground>
    );
  }

  const disponiveis = countAvailableSlots(link);

  if (disponiveis === 0) {
    return (
      <PageBackground>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="text-title-gradient text-2xl font-black">
            Sem horários
          </h1>
          <p className="mt-4 text-zinc-400">
            Não há mais horários disponíveis para este link.
          </p>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="mx-auto max-w-xl px-4 py-12">
        <BrandLogo showText className="mb-4" />
        <h1 className="text-title-gradient text-3xl font-black tracking-tight">
          {link.titulo}
        </h1>
        {link.descricao && (
          <p className="mt-3 text-zinc-300">{link.descricao}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-ui">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-neon-green" />
            {duracaoLabel(link.duracao)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-neon-green" />
            {disponiveis} horário(s) disponível(is)
          </span>
        </div>

        <NeonDot />

        {selected ? (
          <ConfirmacaoForm
            data={selected.data}
            horario={selected.horario}
            onConfirm={handleConfirm}
            onCancel={() => setSelected(null)}
          />
        ) : (
          <SlotPicker
            slots={link.slots}
            agendamentos={link.agendamentos}
            duracao={link.duracao}
            onSelect={(data, horario) => setSelected({ data, horario })}
          />
        )}
      </div>
    </PageBackground>
  );
}
