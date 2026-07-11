---
name: saveloom
description: >-
  Develop and debug the SaveLoom Next.js finance app (Plaid, Prisma, NextAuth,
  Claude AI). Use when working in SaveLoom, on branches feature/unified-theme,
  dashboard, budgets, insights, Plaid, auth errors, NaN money values, or local
  dev setup.
---

# SaveLoom project skill

## Read first

1. [reference.md](reference.md) — architecture, key files, APIs
2. [troubleshooting.md](troubleshooting.md) — if fixing 500, auth, NaN, or build errors
3. [workflows.md](workflows.md) — common task checklists

Also see repo root [AGENTS.md](../../../AGENTS.md).

## Stack

Next.js 15 App Router · TypeScript · Tailwind 4 · PostgreSQL · Prisma · NextAuth v5 (Google) · Plaid · Anthropic Claude · Recharts

## Local dev checklist

```bash
docker start SaveLoom-postgres    # container from start-database.sh, port 5433
npm run dev                       # Turbopack, localhost:3000
```

Docker must run before **sign-in** (Prisma adapter). Landing page works without DB.

## Code conventions

### Money (critical)

Prisma `Decimal` fields break `Number()` and cause **NaN** in UI.

```typescript
import { parseMoney, formatCurrency, computeSavingsRate, formatSavingsRate } from "~/lib/money";
```

- Dashboard metrics: **`GET /api/dashboard/stats`** (server-side, all transactions)
- API responses: map decimals with `parseMoney()` before `NextResponse.json`

### Design system

- Tokens: `src/lib/design.ts` — `surfaces`, `buttons`, `typography`, `iconBadge`, `layout`
- Global: `src/styles/globals.css` — `.page-container`, `.glass-card`, `.hero-card-purple`, `.compact-scroll`
- Shared UI: `AppNav`, `PageShell`, `EmptyState`, `MerchantIcon`, `TransactionListItem`
- Category icons: `src/lib/category-icons.tsx`
- Merchant logos: `src/lib/merchant-icons.ts` + `MerchantIcon.tsx`

### Modals

```typescript
const { showAlert, showConfirm } = useAppModal();
```

Provider in `src/app/layout.tsx`.

### Auth

- Config: `src/server/auth/config.ts` — **do not** set relation fields like `financialGoals: []` in `createUser`
- Sign-in: `/auth/signin` · Callback: `/api/auth/callback/google`

### AI insights

- Engine: `src/lib/ai-insights-engine.ts`
- Default model: `claude-sonnet-4-6` via `ANTHROPIC_MODEL`
- Route: `POST /api/ai/generate-insights`

## Page map

| Route | Main component |
|-------|----------------|
| `/` | `LandingPage` (guest) / `DashboardClient` (auth) |
| `/analytics` | `AnalyticsClient` |
| `/budgets` | `budgets/page.tsx` |
| `/goals` | `goals/page.tsx` |
| `/insights` | `AIInsightsDashboard` (+ health, recommendations tabs) |
| `/onboarding` | `onboarding-flow.tsx` |

## Git

- Feature branch: `feature/unified-theme`
- Commit only when user requests
- Use `gh` for PRs per user rules

## Do not

- Commit secrets (`.env`, `.env.local`)
- Use heavy shadows / emoji UI / gradient icon badges (use ghost `iconBadge` tints)
- Compute dashboard totals client-side from limited transaction payloads — use `/api/dashboard/stats`
