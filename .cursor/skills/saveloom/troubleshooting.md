# SaveLoom troubleshooting

## Internal Server Error on `/` or any page

**Symptom:** `Internal Server Error`, terminal shows `ENOENT` for `.next/.../app-build-manifest.json`

**Fix:**
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
rm -rf .next
npm run dev
```

Stale Turbopack cache — common after crashes or branch switches.

---

## Auth: `/api/auth/error?error=Configuration`

**Cause:** Database unreachable. NextAuth uses Prisma adapter.

**Fix:**
```bash
open -a Docker          # macOS
docker start SaveLoom-postgres
```

Verify `DATABASE_URL` port matches container (often **5433** locally).

**Also fixed:** Do not pass `financialGoals: []` in `auth/config.ts` `createUser` — invalid Prisma relation.

---

## Dashboard shows `$NaN` or `NaN%`

**Cause:** Prisma Decimal not parsed; or savings rate when income = 0.

**Fix pattern:**
- Use `src/lib/money.ts` everywhere
- Dashboard must use **`GET /api/dashboard/stats`**, not client-side math on `/api/transactions` (50-row limit)

**Savings rate:** Shows `N/A` when no income in 30 days — expected.

---

## Total balance $0 with many accounts

**Expected in Plaid sandbox** — balances often zero; transactions still sync.

---

## Insights generation fails

- Check `ANTHROPIC_API_KEY` in `.env.local`
- Model must be `claude-sonnet-4-6` (older Sonnet 4 IDs return 404)
- Restart dev server after env changes

---

## Production build fails: `node-cron`

```
Module not found: Can't resolve 'node-cron'
```

From `src/lib/ai-insights-scheduler.ts` imported by `/api/ai/auto-generate`.

**Fix options:** `npm install node-cron` + types, or remove/guard scheduler import for builds.

---

## Google OAuth redirect mismatch

Authorized redirect URI must be exactly:
`http://localhost:3000/api/auth/callback/google`

---

## Prisma / DB

```bash
./start-database.sh
npm run db:push
npm run db:studio
```

Container name: `SaveLoom-postgres`
