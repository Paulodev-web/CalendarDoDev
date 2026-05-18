"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageBackground } from "@/components/layout/PageBackground";
import { NeonDot } from "@/components/ui/NeonDot";
import { getBookingSession, type BookingSession } from "@/lib/booking";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { formatDataLonga } from "@/lib/dates";
import { duracaoLabel } from "@/lib/types";

export default function ConfirmadoPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const [booking] = useState<BookingSession | null>(() => getBookingSession());

  if (!booking) {
    return (
      <PageBackground>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <BrandLogo showText className="mx-auto mb-6 justify-center" />
          <p className="text-muted-ui">
            Não encontramos os dados deste agendamento. Se você acabou de
            confirmar, tente agendar novamente.
          </p>
          <Link
            href={`/agendar/${linkId}`}
            className="mt-4 inline-block text-neon-green hover:underline"
          >
            Voltar ao agendamento
          </Link>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <BrandLogo showText className="mx-auto mb-6 justify-center" />
        <CheckCircle2 className="mx-auto h-16 w-16 text-neon-green drop-shadow-[0_0_20px_rgba(0,255,65,0.5)]" />
        <p className="section-tag mt-6">[ Confirmado ]</p>
        <h1 className="text-title-gradient mt-2 text-3xl font-black">
          Agendamento realizado!
        </h1>
        <p className="mt-4 text-zinc-300">
          Olá, <strong className="text-white">{booking.nome}</strong>. Sua
          reunião foi confirmada.
        </p>

        <NeonDot />

        <div className="card-dark mx-auto max-w-sm rounded-xl border border-neon-green/30 p-6 text-left">
          <p className="text-sm text-muted-ui">Reunião</p>
          <p className="font-bold text-neon-green">{booking.titulo}</p>
          <p className="mt-4 text-sm text-muted-ui">Data e horário</p>
          <p className="text-white">
            {formatDataLonga(booking.data)} às {booking.horario}
          </p>
          <p className="mt-4 text-sm text-muted-ui">Duração</p>
          <p className="text-white">{duracaoLabel(booking.duracao)}</p>
        </div>

        <p className="mt-6 text-sm text-muted-ui">
          Seu horário foi reservado com sucesso.
        </p>
      </div>
    </PageBackground>
  );
}
