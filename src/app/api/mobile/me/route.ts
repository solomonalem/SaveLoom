import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { getRequestUserId } from "~/server/request-auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await getRequestUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        onboardingCompleted: true,
        hasConnectedBank: true,
        riskTolerance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Mobile me error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
