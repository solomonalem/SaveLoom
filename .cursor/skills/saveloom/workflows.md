# SaveLoom workflows

## Start a new AI chat

Tell the agent:

> Read `AGENTS.md` and use the SaveLoom skill in `.cursor/skills/saveloom/`. Branch is `feature/unified-theme`.

Or in Cursor: `@AGENTS.md` `@.cursor/skills/saveloom/SKILL.md`

## Implement a UI change

1. Read `src/lib/design.ts` and an similar page (e.g. `budgets/page.tsx`)
2. Reuse `PageShell`, `AppNav`, tokens — no one-off card styles
3. Money display → `formatCurrency` from `~/lib/money`

## Fix dashboard numbers

1. Read `src/app/api/dashboard/stats/route.ts`
2. Ensure `parseMoney` on all Decimal fields
3. Never aggregate from `GET /api/transactions` alone (50-row cap)

## Add a merchant logo

Add regex → domain in `src/lib/merchant-icons.ts` `MERCHANTS` array. UI uses `MerchantIcon` automatically.

## Run checks

```bash
npm run check          # lint + tsc
npm run dev            # local
docker start SaveLoom-postgres
```

## Create a PR

```bash
git push -u origin feature/unified-theme
gh pr create ...
```

Follow user rules for commit/PR format.
