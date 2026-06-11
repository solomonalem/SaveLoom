//src/lib/onboarding.ts
import { db } from "~/server/db";

export async function getUserOnboardingStatus(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            onboardingCompleted: true,
            onboardingStep: true,
            hasConnectedBank: true,
            age: true,
            location: true,
            occupation: true,
            maritalStatus: true,
            incomeRange: true,
            primaryGoal: true,
        },
    });

    if (!user) {
        return null;
    }

    return {
        isCompleted: user.onboardingCompleted,
        currentStep: user.onboardingStep,
        hasConnectedBank: user.hasConnectedBank,
        profileCompleteness: calculateProfileCompleteness(user),
    };
}

function calculateProfileCompleteness(user: any): number {
    const fields = [
        user.age,
        user.location,
        user.occupation,
        user.maritalStatus,
        user.incomeRange,
        user.primaryGoal,
    ];

    const completedFields = fields.filter(field => field !== null && field !== "").length;
    return Math.round((completedFields / fields.length) * 100);
}

export async function markOnboardingComplete(userId: string) {
    return await db.user.update({
        where: { id: userId },
        data: {
            onboardingCompleted: true,
            onboardingStep: 4,
            updatedAt: new Date(),
        },
    });
}