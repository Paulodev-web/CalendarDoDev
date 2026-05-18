# ReuniCheck — Meeting Scheduler

Sistema de agendamento de reuniões para agências de software. O admin cria links com dias e horários disponíveis; o cliente agenda sem login. A agenda interna permite bloquear horários e visualizar todos os agendamentos recebidos.

## Pré-requisitos

- Node.js 18+
- npm
- Projeto [Supabase](https://supabase.com) com Postgres

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local`:

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (somente servidor; nunca expor no cliente) |
| `NEXT_PUBLIC_BASE_URL` | URL pública do app (links copiáveis) |
| `NEXT_PUBLIC_BRAND_NAME` | Nome exibido na UI |
| `NEXT_PUBLIC_AGENCY_URL` | URL do site da agência (referência) |

## Banco de dados

As tabelas `links`, `agendamentos` e `bloqueios` ficam no Postgres do Supabase. A migration inicial (`create_reunicheck_schema`) cria:

- `links` — configuração do link e `slots` (jsonb)
- `agendamentos` — reservas dos clientes (`UNIQUE` em link + data + horário)
- `bloqueios` — horários bloqueados pelo admin

## Executar localmente

```bash
npm install
cp .env.local.example .env.local
# Preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

- Agenda admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Gerenciar links: [http://localhost:3000/admin/links](http://localhost:3000/admin/links)
- Agendamento público: `http://localhost:3000/agendar/[linkId]`

## Sistema de Bloqueios

Na agenda (`/admin`), clique em um dia vazio para criar um bloqueio (título, data, horário início e fim). Bloqueios aparecem em cinza no calendário.

- Horários que colidem com um bloqueio **não aparecem** para o cliente (`GET /api/links/:id?publico=true`).
- Tentativas de agendar em horário bloqueado retornam **409** em `POST /api/agendar`.
- Clique em um bloqueio existente para excluí-lo.
- Agendamentos de clientes aparecem em verde (`#00FF41`).

## Estrutura de pastas

```
app/
  admin/              # Agenda (calendário + bloqueios)
  admin/links/        # CRUD de links de agendamento
  agendar/[linkId]/   # Fluxo do cliente
  api/                # Route Handlers (links, bloqueios, agendar)
components/           # UI (AgendaCalendar, SlotBuilder, SlotPicker, …)
lib/
  supabase/           # Cliente Postgres (server-only)
  links.ts            # CRUD de links e agendamentos
  bloqueios.ts        # CRUD de bloqueios
```

## Deploy na Vercel

1. Conecte o repositório na Vercel.
2. Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e as variáveis `NEXT_PUBLIC_*`.
3. Defina `NEXT_PUBLIC_BASE_URL` para a URL de produção (ex: `https://seu-app.vercel.app`).

A persistência usa **apenas Postgres (Supabase)** — não há arquivo local nem cache de dados em produção.

## Identidade visual

Consulte [`indentidadevisual.md`](indentidadevisual.md) para cores, tipografia e componentes (tema dark / neon green `#00FF41`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
