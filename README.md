# SaveLoom

SaveLoom is an AI-powered personal finance coach. Users connect bank accounts, track spending, set budgets and goals, and receive personalized insights and recommendations.

Built on the [T3 Stack](https://create.t3.gg/) (Next.js, TypeScript, Tailwind, Prisma, tRPC scaffold).

## Features

- **Google sign-in** with onboarding for new users
- **Bank linking** via Plaid (accounts and transaction sync)
- **Dashboard** with balances, connected accounts, and transaction history
- **Budgets** — category-based spending limits
- **Financial goals** — targets with contribution tracking
- **Analytics** — spending trends and charts
- **AI insights & recommendations** — powered by Anthropic Claude

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js v5 (Google OAuth) |
| Bank data | Plaid |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| Charts | Recharts, Chart.js, Nivo |

Most app logic lives in Next.js API routes under `src/app/api/`. tRPC is scaffolded but minimally used.

## Prerequisites

- Node.js 20+
- npm
- Docker or Podman (for local Postgres via `start-database.sh`), or your own PostgreSQL instance
- API keys:
  - [Google OAuth](https://console.cloud.google.com/) — for sign-in
  - [Plaid](https://dashboard.plaid.com/) — sandbox keys are fine for local dev
  - [Anthropic](https://console.anthropic.com/) — optional unless you use AI features

## Local setup

### 1. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate` automatically.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` with your credentials. Required variables are validated in `src/env.js`:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Production | Session encryption secret (`npx auth secret`) |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PLAID_CLIENT_ID` | Yes | Plaid client ID |
| `PLAID_SECRET` | Yes | Plaid secret |
| `PLAID_ENV` | Yes | `sandbox`, `development`, or `production` |
| `NEXT_PUBLIC_PLAID_ENV` | Yes | Same value as `PLAID_ENV` (exposed to the browser) |
| `ANTHROPIC_API_KEY` | For AI | Optional at startup; required for `/api/ai/*` routes |

**Google OAuth redirect URI (local):**

```
http://localhost:3000/api/auth/callback/google
```

### 3. Start the database

```bash
chmod +x start-database.sh
./start-database.sh
```

This reads `DATABASE_URL` from `.env` and starts a Postgres container. Skip this step if you already have PostgreSQL running.

### 4. Apply the database schema

```bash
npm run db:push
```

Or create a migration:

```bash
npm run db:generate
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page / dashboard
│   ├── analytics/            # Spending analytics
│   ├── budgets/              # Budget management
│   ├── goals/                # Financial goals
│   ├── insights/             # AI insights
│   ├── onboarding/           # New-user onboarding
│   ├── auth/signin/          # Google sign-in
│   ├── api/                  # REST API routes
│   └── _components/          # React UI components
├── server/
│   ├── auth/                 # NextAuth config
│   └── db.ts                 # Prisma client
├── lib/
│   ├── plaid.ts              # Plaid API client
│   └── ai-insights-engine.ts # Claude-powered analysis
└── env.js                    # Environment variable validation
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:generate` | Create and apply a migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run check` | Lint + typecheck |
| `npm run lint` | ESLint only |

## API overview

| Area | Routes |
|------|--------|
| Auth | `/api/auth/[...nextauth]` |
| Plaid | `/api/plaid/link-token`, `/api/plaid/exchange-token` |
| Accounts | `/api/bank-accounts` |
| Transactions | `/api/transactions`, `/api/transactions/import` |
| Budgets | `/api/budgets` |
| Goals | `/api/goals`, `/api/goals/contribute` |
| Analytics | `/api/analytics`, `/api/financial-health` |
| AI | `/api/ai/insights`, `/api/ai/recommendations`, `/api/ai/generate-insights` |
| Onboarding | `/api/onboarding`, `/api/onboarding/status` |

## Deployment

SaveLoom can be deployed to [Vercel](https://create.t3.gg/en/deployment/vercel) or any Node.js host that supports Next.js.

Before deploying:

1. Set all environment variables in your hosting provider.
2. Use a managed PostgreSQL database (not the Docker script).
3. Update Google OAuth redirect URIs for your production domain.
4. Switch Plaid from `sandbox` to `development` or `production` when ready.

Set `SKIP_ENV_VALIDATION=1` only if you need to skip env validation during Docker builds.

## Learn more

- [Next.js](https://nextjs.org/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://www.prisma.io/docs)
- [Plaid](https://plaid.com/docs/)
- [T3 Stack](https://create.t3.gg/)
