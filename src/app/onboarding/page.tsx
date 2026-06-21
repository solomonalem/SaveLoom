//src/app/onboarding/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import OnboardingFlow from "./onboarding-flow";
import PageShell from "~/app/_components/PageShell";
import { surfaces, typography } from "~/lib/design";

export default async function Onboarding() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            onboardingCompleted: true,
            onboardingStep: true,
        },
    });

    if (user?.onboardingCompleted) {
        redirect("/?returning=true");
    }

    return (
        <PageShell>
            {/* Header */}
            <nav className={surfaces.nav}>
                <div className="page-container px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg">
                                SL
                            </div>
                            <div>
                                <span className="block text-lg font-semibold tracking-tight text-slate-900">
                                    SaveLoom
                                </span>
                                <span className={`block ${typography.label} text-slate-500`}>
                                    Profile Setup
                                </span>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="page-container space-y-6 p-6 lg:p-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                        Welcome to SaveLoom!
                    </h1>
                    <p className={`${typography.pageSubtitle} mx-auto max-w-xl`}>
                        Let&apos;s get to know you for personalized financial advice
                    </p>
                </div>

                <OnboardingFlow
                    user={{
                        id: session.user.id,
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                    }}
                />
            </main>
        </PageShell>
    );
}
