# ReuniCheck — Meeting Scheduler

Sistema de agendamento de reuniões para agências de software. O admin cria links com dias e horários disponíveis; o cliente agenda sem login. A agenda interna permite bloquear horários e visualizar todos os agendamentos recebidos.

## Pré-requisitos

- Node.js 18+
- npm

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local`:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_BASE_URL` | URL pública do app (links copiáveis) |
| `NEXT_PUBLIC_BRAND_NAME` | Nome exibido na UI |
| `NEXT_PUBLIC_AGENCY_URL` | URL do botão "voltar" após agendamento |

## Executar localmente

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

- Agenda admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Gerenciar links: [http://localhost:3000/admin/links](http://localhost:3000/admin/links)
- Agendamento público: `http://localhost:3000/agendar/[linkId]`

Os dados são salvos em `data/db.json` (criado automaticamente se não existir; migra de `data/links.json` se existir).

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
data/db.json          # Persistência local (dev)
lib/                  # db, links, bloqueios, dates, schemas, slots
```

## Deploy na Vercel

1. Conecte o repositório na Vercel.
2. Configure as variáveis de ambiente `NEXT_PUBLIC_*`.
3. Defina `NEXT_PUBLIC_BASE_URL` para a URL de produção (ex: `https://seu-app.vercel.app`).

### Persistência em produção

O filesystem da Vercel é **somente leitura** (exceto `/tmp`, que não persiste entre deploys). O arquivo `data/db.json` **funciona apenas em desenvolvimento local**.

Para produção, migre a camada `lib/db.ts` para:

- Vercel KV / Upstash Redis
- Vercel Blob
- Supabase / Postgres

O restante da aplicação (APIs, UI) permanece igual.

## Identidade visual

Consulte [`indentidadevisual.md`](indentidadevisual.md) para cores, tipografia e componentes (tema dark / neon green `#00FF41`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
