import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import OnboardingFlow from "./onboarding-flow";

export default async function Onboarding() {
    const session = await auth();

    // If not signed in, redirect to sign-in
    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-white">SL</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to SaveLoom! 🎉
                        </h1>
                        <p className="text-gray-600">
                            Let's get to know you better so we can provide personalized financial advice
                        </p>
                    </div>

                    <OnboardingFlow user={session.user} />
                </div>
            </div>
        </div>
    );
}