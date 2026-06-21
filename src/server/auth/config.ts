//src/server/auth/config.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // SaveLoom-specific user fields
      onboardingCompleted?: boolean;
      hasConnectedBank?: boolean;
      riskTolerance?: string;
    } & DefaultSession["user"];
  }

  interface User {
    onboardingCompleted?: boolean;
    hasConnectedBank?: boolean;
    riskTolerance?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        onboardingCompleted: user.onboardingCompleted,
        hasConnectedBank: user.hasConnectedBank,
        riskTolerance: user.riskTolerance,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding", // Redirect new users to onboarding
  },
  events: {
    createUser: async ({ user }) => {
      // When a new user signs up, set SaveLoom defaults
      await db.user.update({
        where: { id: user.id },
        data: {
          onboardingCompleted: false,
          hasConnectedBank: false,
          riskTolerance: "moderate",
        },
      });
    },
  },
} satisfies NextAuthConfig;