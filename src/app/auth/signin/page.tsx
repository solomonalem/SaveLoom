import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SignInButton from "./sign-in-button";

export default async function SignIn() {
    const session = await auth();

    // If user is already signed in, redirect to dashboard
    if (session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">SL</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Welcome to SaveLoom
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your AI-powered financial coach
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <SignInButton />

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}