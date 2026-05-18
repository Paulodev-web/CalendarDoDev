"use client";

import { useState } from "react";
import { formatDataLonga } from "@/lib/dates";
import { LoadingButton } from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConfirmacaoFormProps {
  data: string;
  horario: string;
  onConfirm: (nome: string, email: string) => Promise<void>;
  onCancel: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConfirmacaoForm({
  data,
  horario,
  onConfirm,
  onCancel,
}: ConfirmacaoFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (nome.trim().length < 2) {
      setError("Informe seu nome completo");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Informe um email válido");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(nome.trim(), email.trim());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao confirmar agendamento"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="card-dark border-neon-green/30 bg-surface-dark">
      <CardHeader>
        <CardTitle className="text-white">Confirmar agendamento</CardTitle>
        <CardDescription className="text-zinc-300">
          {formatDataLonga(data)} às {horario}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-zinc-200">
              Nome completo
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="field-surface"
              placeholder="João Silva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-surface"
              placeholder="joao@empresa.com"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-3 pt-2">
            <LoadingButton type="submit" loading={loading}>
              Confirmar agendamento
            </LoadingButton>
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-muted-ui hover:text-white"
              disabled={loading}
            >
              Voltar
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
