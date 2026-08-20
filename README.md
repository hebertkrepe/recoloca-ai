# RecolocaAI

Plataforma de recolocação profissional com IA para profissionais em transição de carreira. Analisa currículos em PDF, extrai perfil automaticamente e organiza candidaturas em um Kanban pessoal.

## Stack

- **Next.js 16** (App Router)
- **Supabase** — autenticação e PostgreSQL
- **Prisma 7** — ORM
- **Groq AI** (`groq/compound-mini`) — análise de currículos
- **Tailwind CSS 4** — UI
- **Sonner** — notificações toast
- **@hello-pangea/dnd** — Kanban drag-and-drop

## Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com)
- Conta [Groq](https://groq.com) (API key)

## Configuração local

1. Clone o repositório e instale dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha `.env.local`:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL do Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (opcional, admin) |
| `GROQ_API_KEY` | Chave da API Groq |

4. Sincronize o banco de dados:

```bash
npm run prisma:push
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:push` | Sincroniza schema com o banco |
| `npm run prisma:studio` | Abre o Prisma Studio |

## Estrutura principal

```
src/
├── app/
│   ├── api/onboarding/    # Upload PDF + análise Groq + salvar perfil
│   ├── auth/callback/     # OAuth callback Supabase
│   ├── cadastro/          # Registro
│   ├── login/             # Login
│   ├── onboarding/        # Upload de currículo
│   ├── dashboard/         # Painel principal
│   ├── minhas-vagas/      # Kanban de candidaturas
│   └── perfil/            # Perfil do usuário
├── components/
├── lib/
│   ├── groq.ts            # Cliente Groq AI
│   ├── prisma.ts          # Cliente Prisma
│   └── supabase/          # Clientes Supabase (browser + server)
└── prisma/                → ../prisma/schema.prisma
prisma/
└── schema.prisma          # Schema do banco
```

## Fluxo do usuário

1. **Cadastro/Login** — Supabase Auth (email ou OAuth)
2. **Onboarding** — Upload de PDF → extração com Groq → confirmação → salva no Prisma
3. **Dashboard** — Métricas e vagas recomendadas
4. **Minhas Vagas** — Kanban com drag-and-drop (persistido em localStorage)
5. **Perfil** — Visualização e edição do perfil

## Deploy

Veja a seção de deploy na documentação do projeto ou consulte as instruções fornecidas no README após o primeiro commit.

## Licença

Projeto privado — todos os direitos reservados.
