import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  createMobileAccessToken,
  verifyGoogleIdToken,
} from "~/lib/mobile-auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { idToken?: string };

    if (!body.idToken) {
      return NextResponse.json({ error: "idToken is required" }, { status: 400 });
    }

    const profile = await verifyGoogleIdToken(body.idToken);
    if (!profile) {
      return NextResponse.json({ error: "Invalid Google ID token" }, { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          onboardingCompleted: false,
          hasConnectedBank: false,
          riskTolerance: "moderate",
        },
      });
    } else if (profile.name || profile.picture) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: profile.name ?? user.name,
          image: profile.picture ?? user.image,
        },
      });
    }

    const accessToken = await createMobileAccessToken(user.id);

    return NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        onboardingCompleted: user.onboardingCompleted,
        hasConnectedBank: user.hasConnectedBank,
      },
    });
  } catch (error) {
    console.error("Mobile Google auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
