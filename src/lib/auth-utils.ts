// src/lib/auth-utils.ts
import { db } from "~/server/db";

export async function getPostSigninRedirect(userId: string): Promise<string> {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                onboardingCompleted: true,
                hasConnectedBank: true,
            },
        });

        if (!user) {
            return "/onboarding";
        }

        // If onboarding not completed, go to onboarding
        if (!user.onboardingCompleted) {
            return "/onboarding";
        }

        // If onboarding completed but no bank connected, go to dashboard
        // (dashboard will show bank connection prompts)
        return "/";

    } catch (error) {
        console.error("Error determining post-signin redirect:", error);
        // Default to dashboard on error
        return "/";
    }
}

// Alternative: Add this to your NextAuth configuration callbacks
export const authCallbacks = {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;

        // Allows callback URLs on the same origin
        if (new URL(url).origin === baseUrl) return url;

        return baseUrl;
    },

    async session({ session, token }: { session: any; token: any }) {
        if (session.user && token.sub) {
            session.user.id = token.sub;

            // Check onboarding status and attach to session
            try {
                const user = await db.user.findUnique({
                    where: { id: token.sub },
                    select: {
                        onboardingCompleted: true,
                        hasConnectedBank: true,
                    },
                });

                session.user.onboardingCompleted = user?.onboardingCompleted || false;
                session.user.hasConnectedBank = user?.hasConnectedBank || false;
            } catch (error) {
                console.error("Error fetching user onboarding status:", error);
            }
        }
        return session;
    },
};