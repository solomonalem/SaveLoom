# SaveLoom Mobile (Expo)

React Native app for SaveLoom — lives in the **same repo** as the Next.js web app.

## Phase status

- [x] **Phase 0** — Google sign-in, JWT auth, API client
- [x] **Phase 1** — Tab shell + dashboard stats
- [x] **Phase 2** — Connected accounts list (Plaid link via web for now)
- [x] **Phase 3** — Transactions list
- [x] **Phase 4** — AI insights and recommendations
- [x] **Phase 5** — Budgets and goals (Plan tab)
- [x] **Phase 6** — Native Google sign-in, in-app Plaid Link, production config

## Prerequisites

1. SaveLoom web API running: `npm run dev` (port 3000)
2. Docker Postgres up
3. Google OAuth **Web client ID** (same as `AUTH_GOOGLE_ID` in root `.env`)
4. Plaid sandbox keys in root `.env` (for bank linking)

## Quick start (Expo Go — limited)

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

Expo Go supports **browser Google sign-in** and **web bank linking**. Native Google + Plaid Link require a **development build** (see below).

### Environment (`mobile/.env`)

See `.env.example`. For a physical device, use a tunnel URL for `EXPO_PUBLIC_API_URL`.

## Development build (full features)

Native Google sign-in and in-app Plaid Link require a dev build (`com.saveloom.app`):

```bash
cd mobile
npm install

# First time — generates android/ and ios/ native projects
npx expo prebuild

# Android (device or emulator with USB debugging)
npm run android:build

# iOS (Mac + Xcode)
npm run ios:build

# After the native app is installed, start Metro for the dev client
npm run start:dev-client
```

### Google Cloud setup (dev build)

1. **Web client ID** → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (used for ID token verification)
2. **Android OAuth client** → package `com.saveloom.app`, SHA-1 from your debug keystore:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
3. **iOS OAuth client** → bundle ID `com.saveloom.app`

### Plaid Dashboard setup (dev build)

Register in [Plaid Dashboard](https://dashboard.plaid.com/developers/apps):

- Android package: `com.saveloom.app`
- iOS bundle ID: `com.saveloom.app`

### Sign-in behavior

| Runtime | Google sign-in | Bank linking |
|---------|----------------|--------------|
| Expo Go | Browser OAuth via API | Web fallback button |
| Dev build | Native `@react-native-google-signin` | In-app Plaid Link |

### Production checklist

- Set `EXPO_PUBLIC_DEV_BYPASS_AUTH=false` in `.env`
- Remove `EXPO_PUBLIC_DEV_ACCESS_TOKEN`
- Use HTTPS API URL (not localhost)
- Build release with EAS or `expo run:android --variant release`
- Register production OAuth clients and Plaid production keys

### Expo Go version

Play Store Expo Go only supports SDK 54. SaveLoom uses SDK 56 — install Expo Go from [expo.dev/go?sdkVersion=56&platform=android&device=true](https://expo.dev/go?sdkVersion=56&platform=android&device=true).

## Run

```bash
cd mobile
npm start              # Expo Go
npm run start:dev-client   # After installing dev build
npm run android:build  # Dev build → Android
npm run ios:build      # Dev build → iOS
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
| `GET /api/ai/insights` | AI spending insights |
| `GET /api/recommendations` | Actionable recommendations |
| `GET /api/budgets` | Active budgets with spending |
| `GET /api/goals` | Financial goals with progress |
| `POST /api/plaid/link-token` | Create Plaid Link token |
| `POST /api/plaid/exchange-token` | Connect bank after Plaid success |

## Project structure

```
mobile/
├── app/
│   ├── (auth)/login.tsx
│   ├── auth/callback.tsx   # Deep-link handler after sign-in
│   └── (tabs)/             # Dashboard, Accounts, Transactions, Insights, Plan, More
├── components/PlaidLinkButton.tsx
├── lib/native-google-auth.ts
├── lib/plaid-link.ts
├── lib/sign-in.ts
├── lib/web-auth.ts         # Browser OAuth fallback (Expo Go)
├── lib/api.ts
└── lib/config.ts
```
