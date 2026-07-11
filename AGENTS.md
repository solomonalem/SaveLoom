# SaveLoom — AI assistant guide

Read this file first when continuing work in a **new chat** or with any AI coding tool.

## Quick start (local dev)

```bash
docker start SaveLoom-postgres   # or ./start-database.sh
npm run dev                      # http://localhost:3000
```

**Requires:** Docker Postgres (port **5433** in current `.env`), Google OAuth, Plaid sandbox keys. See `.env.example`.

**Active branch:** `feature/unified-theme` (pushed). Base: `main`.

## Where knowledge lives

| Resource | Purpose |
|----------|---------|
| [`.cursor/skills/saveloom/SKILL.md`](.cursor/skills/saveloom/SKILL.md) | **Primary skill** — architecture, conventions, workflows |
| [`.cursor/skills/saveloom/reference.md`](.cursor/skills/saveloom/reference.md) | File map, API list, env vars, design tokens |
| [`.cursor/skills/saveloom/troubleshooting.md`](.cursor/skills/saveloom/troubleshooting.md) | Common errors (500, auth, NaN, build) |
| [`.cursor/rules/`](.cursor/rules/) | Cursor rules (auto-loaded by glob) |
| [`README.md`](README.md) | Human setup docs |

**In Cursor:** mention “use the SaveLoom skill” or `@.cursor/skills/saveloom/SKILL.md`.

## Product summary

AI personal finance app: Google sign-in → Plaid bank link → transactions → budgets/goals → analytics → Claude insights.

## Non-negotiable conventions

1. **Money:** Always use `parseMoney()` / `formatCurrency()` from `src/lib/money.ts`. Never raw `Number()` on Prisma Decimal fields in UI.
2. **UI:** Use tokens from `src/lib/design.ts` (slate + indigo, glass cards). Lucide icons only — no emojis in UI.
3. **Modals:** Use `useAppModal()` from `src/app/_components/modal/ModalProvider.tsx` — no `alert()` / `confirm()`.
4. **Layout:** `.page-container` max-width 2000px in `src/styles/globals.css`.
5. **Auth:** Prisma adapter — DB must be running or sign-in shows `error=Configuration`.
6. **Commits:** Only when the user asks. Branch: `feature/unified-theme` unless they say otherwise.

## Recent session work (2025–2026)

- Unified design system, compact lists, merchant brand icons (`src/lib/merchant-icons.ts`)
- Marketing landing page (`src/app/_components/landing/LandingPage.tsx`)
- Dashboard stats API (`src/app/api/dashboard/stats/route.ts`) — fixes NaN / wrong savings rate
- Claude model default: `claude-sonnet-4-6` (`ANTHROPIC_MODEL` in env)
- Auth fix: removed invalid `financialGoals: []` in `createUser` event
- Known build issue: `node-cron` missing for `src/lib/ai-insights-scheduler.ts` (production build only)

## Before you finish a task

- Run `npm run check` or at least verify changed routes compile
- If dev 500: `rm -rf .next && npm run dev` and ensure Docker Postgres is up
- Do not commit `.env` / `.env.local`
