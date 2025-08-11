import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import DashboardClient from "~/app/_components/DashboardClient";

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
        // Dashboard for authenticated users - now a client component
        <DashboardClient
          user={{
            name: session.user?.name,
            image: session.user?.image,
          }}
        />
      )}
    </HydrateClient>
  );
}