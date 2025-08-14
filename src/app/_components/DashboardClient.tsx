"use client";

import Link from "next/link";
import PlaidLink from "./PlaidLink";
import ConnectedAccounts from "./ConnectedAccounts";

interface DashboardClientProps {
    user: {
        name?: string | null;
        image?: string | null;
    };
}

export default function DashboardClient({ user }: DashboardClientProps) {
    const handlePlaidSuccess = () => {
        // Refresh the page after successful connection
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-bold text-white">SL</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">SaveLoom</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Hello, {user.name}</span>
                            {user.image && (
                                <img
                                    src={user.image}
                                    alt={user.name || ""}
                                    className="h-8 w-8 rounded-full"
                                />
                            )}
                            <form action="/api/auth/signout" method="post">
                                <button
                                    type="submit"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Welcome to SaveLoom! 🎉
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Your personalized financial journey starts here. Let's get you set up for success!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">👤</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Complete Your Profile</h3>
                            <p className="text-gray-600 mb-6">Tell us about your financial goals, interests, and lifestyle to get personalized recommendations</p>
                            <Link
                                href="/onboarding"
                                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Start Onboarding
                            </Link>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">🏦</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Connect Your Bank</h3>
                            <p className="text-gray-600 mb-6">Securely link your bank accounts for automatic transaction tracking and insights</p>
                            <PlaidLink onSuccess={handlePlaidSuccess} />
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">View Dashboard</h3>
                            <p className="text-gray-600 mb-6">See your financial overview, spending patterns, and AI-generated insights</p>
                            <Link
                                href="/dashboard"
                                className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                    <div className="mt-12 max-w-4xl mx-auto">
                        <ConnectedAccounts />
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your SaveLoom Journey</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                                <div className="text-gray-600">Accounts Connected</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                                <div className="text-gray-600">Transactions Tracked</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                                <div className="text-gray-600">Money Saved</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                                <div className="text-gray-600">Goals Achieved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}