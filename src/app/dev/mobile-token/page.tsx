import { redirect } from "next/navigation";

import { createMobileAccessToken } from "~/lib/mobile-auth";
import { auth } from "~/server/auth";

export default async function DevMobileTokenPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dev/mobile-token");
  }

  const accessToken = await createMobileAccessToken(session.user.id);

  return (
    <main className="page-container mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Mobile dev token</h1>
      <p className="mt-2 text-sm text-slate-600">
        Signed in as {session.user.email}. Copy this token into{" "}
        <code className="rounded bg-slate-100 px-1">mobile/.env</code>:
      </p>
      <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
        EXPO_PUBLIC_DEV_ACCESS_TOKEN={accessToken}
      </pre>
      <p className="mt-4 text-sm text-slate-500">
        Also set <code className="rounded bg-slate-100 px-1">EXPO_PUBLIC_API_URL</code>{" "}
        to a URL your phone can reach (LAN IP or ngrok). Restart Expo after saving.
      </p>
      <p className="mt-2 text-sm text-amber-700">
        Development only — never commit this token or use in production.
      </p>
    </main>
  );
}
