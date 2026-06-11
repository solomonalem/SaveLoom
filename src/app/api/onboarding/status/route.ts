//src/app/api/onboarding/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getUserOnboardingStatus } from "~/lib/onboarding";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const status = await getUserOnboardingStatus(session.user.id);

        if (!status) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(status);

    } catch (error) {
        console.error("Error fetching onboarding status:", error);
        return NextResponse.json(
            { error: "Failed to fetch onboarding status" },
            { status: 500 }
        );
    }
}