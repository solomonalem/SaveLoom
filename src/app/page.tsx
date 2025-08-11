import Link from "next/link";
import { auth, signOut } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      {!session ? (
        // Landing page for non-authenticated users
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-8">
                <span className="text-3xl font-bold text-white">SL</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Meet Your AI Financial Coach
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                SaveLoom learns your spending habits, understands your goals, and gives you
                personalized recommendations to save money and invest wisely.
              </p>
              <Link
                href="/auth/signin"
                className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Get Started Free
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">AI-Powered Insights</h3>
                <p className="text-gray-600">Get personalized recommendations based on your spending patterns and financial goals</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-5xl mb-4">🏦</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Bank Integration</h3>
                <p className="text-gray-600">Securely connect your accounts and track transactions automatically with Plaid</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Saving</h3>
                <p className="text-gray-600">Find opportunities to save money and reach your financial goals faster</p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-gray-500 text-sm">
                Trusted by thousands of users • Bank-level security • Free to get started
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Dashboard for authenticated users
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
                  <span className="text-gray-700">Hello, {session.user?.name}</span>
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ""}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <form action={async () => {
                    "use server";
                    await signOut();
                  }}>
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
                  <button className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium">
                    Connect Bank Account
                  </button>
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
      )}
    </HydrateClient>
  );
}