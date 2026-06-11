//src/app/onboarding/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import OnboardingFlow from "./onboarding-flow";

export default async function Onboarding() {
    const session = await auth();

    // If not signed in, redirect to sign-in
    if (!session) {
        redirect("/auth/signin");
    }

    // Check if user has already completed onboarding
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            onboardingCompleted: true,
            onboardingStep: true,
        },
    });

    // If onboarding is already completed, redirect to dashboard
    if (user?.onboardingCompleted) {
        redirect("/?returning=true");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

            {/* Header */}
            <nav className="relative bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/50 z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-lg font-black text-white">SL</span>
                            </div>
                            <div>
                                <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    SaveLoom
                                </span>
                                <p className="text-xs text-gray-500 font-medium">Profile Setup</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <a
                                href="/"
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative max-w-4xl mx-auto p-6 lg:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Welcome to SaveLoom! 🎉
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Let's get to know you better so we can provide personalized financial advice
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
        </div>
    );
}