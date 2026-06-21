# SaveLoom reference

## Environment (`.env` / `.env.local`)

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Local: `postgresql://postgres:password@localhost:5433/SaveLoom` |
| `AUTH_SECRET` | `npx auth secret` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Redirect: `http://localhost:3000/api/auth/callback/google` |
| `PLAID_*` / `NEXT_PUBLIC_PLAID_ENV` | Sandbox for dev |
| `ANTHROPIC_API_KEY` | Required for AI routes |
| `ANTHROPIC_MODEL` | Default `claude-sonnet-4-6` |

Validated in `src/env.js`. Copy from `.env.example`.

## Directory map

```
src/
├── app/
│   ├── page.tsx                    # Landing vs dashboard
│   ├── _components/
│   │   ├── DashboardClient.tsx   # Main dashboard
│   │   ├── landing/LandingPage.tsx
│   │   ├── ConnectedAccounts.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── TransactionListItem.tsx
│   │   ├── MerchantIcon.tsx
│   │   ├── AppNav.tsx, PageShell.tsx, EmptyState.tsx
│   │   ├── modal/                  # AppModal, ModalProvider
│   │   └── analytics/AnalyticsClient.tsx
│   └── api/
│       ├── dashboard/stats/        # Dashboard metrics (use this)
│       ├── bank-accounts/
│       ├── transactions/           # GET limited to 50 — not for stats
│       ├── plaid/
│       ├── budgets/, goals/
│       ├── analytics/, financial-health/
│       └── ai/
├── lib/
│   ├── design.ts                 # UI tokens
│   ├── money.ts                  # parseMoney, formatCurrency
│   ├── merchant-icons.ts
│   ├── category-icons.tsx
│   ├── ai-insights-engine.ts
│   ├── plaid.ts
│   └── parse-api-error.ts
├── server/auth/                  # NextAuth config + index
└── styles/globals.css
prisma/schema.prisma
```

## API routes

| Route | Purpose |
|-------|---------|
| `GET /api/dashboard/stats` | Accounts count, balances, 30d income/expense, savings rate, top category |
| `GET /api/bank-accounts` | Active accounts (balances as numbers) |
| `GET /api/transactions` | Last 50 transactions (display only) |
| `POST /api/transactions/import` | Plaid sync |
| `GET /api/analytics?timeframe=` | Charts + metrics |
| `POST /api/ai/generate-insights` | Regenerate Claude insights |

## Data model notes

- **Transaction amounts:** negative = expense, positive = income (Plaid inverted on import)
- **BankAccount.currentBalance:** Decimal — always `parseMoney` in APIs
- **GoalContribution.transactionId:** `@unique` in schema (required for `db:push`)

## Design tokens (`design.ts`)

- `surfaces.card`, `surfaces.cardHover`, `surfaces.list`, `glass-card` in CSS
- `iconBadge.sm|success|danger|warning|muted` — light tint, colored icon
- `layout.page`, `layout.gridStats`, `layout.gridCards`
- `summaryStat.card` for metric tiles

## Plaid sandbox quirks

- Account balances often **$0** while transactions exist — not a bug
- Dashboard label: **Total balance** (sum of linked accounts), not full net worth

## Branches

- `main` — baseline
- `feature/unified-theme` — design refresh, landing, merchant icons, money fixes (latest work)
- `feature/wider-layout` — may exist; merged concepts into unified-theme
