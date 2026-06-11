//src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const {
            age,
            location,
            occupation,
            maritalStatus,
            dependents,
            hobbies,
            interests,
            lifestyle,
            incomeRange,
            riskTolerance,
            primaryGoal,
            goalTargetAmount,
        } = body;

        // Convert string values to appropriate types
        const ageNumber = age ? parseInt(age) : null;
        const dependentsNumber = dependents ? parseInt(dependents) : 0;
        const goalAmount = goalTargetAmount ? parseFloat(goalTargetAmount) : null;

        // Update user profile with onboarding data
        const updatedUser = await db.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                // Personal Information
                age: ageNumber,
                location: location || null,
                occupation: occupation || null,
                maritalStatus: maritalStatus || null,
                dependents: dependentsNumber,

                // Interests & Lifestyle
                hobbies: hobbies || [],
                interests: interests || [],
                lifestyle: lifestyle || "moderate",

                // Financial Profile
                incomeRange: incomeRange || null,
                riskTolerance: riskTolerance || "moderate",

                // Financial Goals
                primaryGoal: primaryGoal || null,
                goalTargetAmount: goalAmount,

                // Onboarding Status
                onboardingCompleted: true,
                onboardingStep: 4,

                updatedAt: new Date(),
            },
        });

        // Create a financial goal if specified
        if (primaryGoal && goalAmount) {
            await db.financialGoal.create({
                data: {
                    userId: session.user.id,
                    title: getGoalTitle(primaryGoal),
                    description: `Primary financial goal: ${getGoalTitle(primaryGoal)}`,
                    targetAmount: goalAmount,
                    currentAmount: 0,
                    category: getGoalCategory(primaryGoal),
                    priority: 1, // Highest priority as it's the primary goal
                },
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                onboardingCompleted: updatedUser.onboardingCompleted,
            },
        });

    } catch (error) {
        console.error("Error saving onboarding data:", error);
        return NextResponse.json(
            { error: "Failed to save onboarding data" },
            { status: 500 }
        );
    }
}

// Helper function to get goal title from goal type
function getGoalTitle(goalType: string): string {
    const goalTitles: Record<string, string> = {
        emergency_fund: "Emergency Fund",
        house: "House Down Payment",
        retirement: "Retirement Savings",
        debt_payoff: "Debt Payoff",
        vacation: "Vacation Fund",
        investment: "Investment Portfolio",
        education: "Education Fund",
    };

    return goalTitles[goalType] || "Financial Goal";
}

// Helper function to get goal category from goal type
function getGoalCategory(goalType: string): string {
    const goalCategories: Record<string, string> = {
        emergency_fund: "emergency",
        house: "purchase",
        retirement: "investment",
        debt_payoff: "debt",
        vacation: "purchase",
        investment: "investment",
        education: "purchase",
    };

    return goalCategories[goalType] || "purchase";
}