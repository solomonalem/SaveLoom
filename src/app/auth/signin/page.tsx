import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SignInButton from "./sign-in-button";
import PageShell from "~/app/_components/PageShell";
import { typography } from "~/lib/design";

export default async function SignIn() {
    const session = await auth();

    if (session) {
        redirect("/");
    }

    return (
        <PageShell className="flex items-center justify-center">
            <div className="glass-card w-full max-w-md space-y-8 rounded-2xl p-8">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-lg font-bold text-white shadow-lg">
                        SL
                    </div>
                    <h2 className={`${typography.pageTitle} text-2xl sm:text-3xl`}>
                        Welcome to SaveLoom
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Your AI-powered financial coach
                    </p>
                </div>

                <SignInButton />

                <p className="text-center text-xs text-slate-500">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </PageShell>
    );
}
