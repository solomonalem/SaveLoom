# SaveLoom Mobile (Expo)

React Native app for SaveLoom — lives in the **same repo** as the Next.js web app.

## Phase status

- [x] **Phase 0** — Google sign-in, JWT auth, API client
- [x] **Phase 1** — Tab shell + dashboard stats
- [x] **Phase 2** — Connected accounts list (Plaid link via web for now)
- [x] **Phase 3** — Transactions list

## Prerequisites

1. SaveLoom web API running: `npm run dev` (port 3000)
2. Docker Postgres up
3. Google OAuth **Web client ID** (same as `AUTH_GOOGLE_ID` in root `.env`)

## Setup

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

### Environment (`mobile/.env`)

```bash
# iOS simulator / Android emulator / web preview
EXPO_PUBLIC_API_URL=http://localhost:3000

# Physical device (Expo Go) — use ngrok (Google rejects LAN IP redirect URIs)
# EXPO_PUBLIC_API_URL=https://YOUR-ID.ngrok-free.app
```

### Google sign-in (Expo Go)

**Why this is tricky:** Google OAuth on mobile has three bad options in Expo Go:

| Approach | Problem |
|----------|---------|
| `expo-auth-session` Google provider | **Deprecated** — Android SDK 53+ redirects to google.com after login |
| Server OAuth with LAN IP (`192.168.x.x`) | Google **rejects** private IP redirect URIs |
| Native `@react-native-google-signin` | **Best long-term** — requires a dev build, not Expo Go |

**What we use in Expo Go:** browser OAuth through your Next.js API (`lib/web-auth.ts`), with a **public HTTPS ngrok URL** for the API on physical devices.

1. Ensure root `.env` has `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET`
2. Start the API and ngrok:
   ```bash
   npm run dev                    # repo root
   npx ngrok http 3000            # copy the https URL
   ```
3. Set `EXPO_PUBLIC_API_URL=https://YOUR-ID.ngrok-free.app` in `mobile/.env`
4. In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), open your **Web** OAuth client and add:
   ```
   https://YOUR-ID.ngrok-free.app/api/mobile/auth/callback
   ```
5. **OAuth consent screen → Test users** — add every Gmail you sign in with
6. Restart Metro and reload the Expo app

**How it works:** app opens Chrome → your API → Google → API exchanges code → redirects to `exp://…/auth/callback?token=JWT` → Expo Go receives the deep link.

**Production path:** `@react-native-google-signin/google-signin` + `npx expo run:android` (dev build). See [Expo Google auth guide](https://docs.expo.dev/guides/google-authentication/).

### Expo Go version

Play Store Expo Go only supports SDK 54. SaveLoom uses SDK 56 — install Expo Go from [expo.dev/go?sdkVersion=56&platform=android&device=true](https://expo.dev/go?sdkVersion=56&platform=android&device=true).

## Run

```bash
cd mobile
npm start          # Expo dev tools
npm run ios        # iOS simulator
npm run android    # Android emulator
```

## API endpoints used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/mobile/auth/start` | Begin Google sign-in (opens in browser) |
| `GET /api/mobile/auth/callback` | Google redirect target; issues JWT to app deep link |
| `GET /api/mobile/me` | Current user (Bearer token) |
| `GET /api/dashboard/stats` | Dashboard metrics |
| `GET /api/bank-accounts` | Connected bank accounts |
| `GET /api/transactions` | Recent transactions (last 50) |

## Project structure

```
mobile/
├── app/
│   ├── (auth)/login.tsx
│   ├── auth/callback.tsx   # Deep-link handler after sign-in
│   └── (tabs)/             # Dashboard, Accounts, Insights, More
├── contexts/AuthContext.tsx
├── lib/web-auth.ts         # Browser-based Google sign-in
├── lib/api.ts
└── lib/config.ts
```
