// src/app/api/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { getRequestUserId } from "~/server/request-auth";
import { db } from '~/server/db';

export async function GET(req: NextRequest) {
    try {
        const userId = await getRequestUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const goals = await db.financialGoal.findMany({
            where: { userId },
            orderBy: [
                { isCompleted: 'asc' },
                { priority: 'asc' }
            ]
        });

        // Calculate progress for each goal
        const goalsWithProgress = goals.map(goal => ({
            ...goal,
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            monthlyContribution: goal.monthlyContribution ? Number(goal.monthlyContribution) : null,
            progress: Number(goal.targetAmount) > 0
                ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                : 0
        }));

        return NextResponse.json({
            goals: goalsWithProgress,
            count: goalsWithProgress.length
        });
    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, targetAmount, targetDate, category, priority, monthlyContribution } = body;

        if (!title || !targetAmount || !category) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['title', 'targetAmount', 'category']
            }, { status: 400 });
        }

        const goal = await db.financialGoal.create({
            data: {
                userId: session.user.id,
                title,
                description,
                targetAmount: parseFloat(targetAmount),
                targetDate: targetDate ? new Date(targetDate) : null,
                category,
                priority: priority || 1,
                monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : null,
                currentAmount: 0,
                isCompleted: false
            }
        });

        return NextResponse.json({
            success: true,
            goal: {
                ...goal,
                targetAmount: Number(goal.targetAmount),
                currentAmount: Number(goal.currentAmount),
                monthlyContribution: goal.monthlyContribution ? Number(goal.monthlyContribution) : null
            }
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, currentAmount, isCompleted } = body;

        if (!id) {
            return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
        }

        const goal = await db.financialGoal.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
                isCompleted: isCompleted !== undefined ? isCompleted : undefined,
                completedDate: isCompleted ? new Date() : null
            }
        });

        return NextResponse.json({
            success: true,
            goal: {
                ...goal,
                targetAmount: Number(goal.targetAmount),
                currentAmount: Number(goal.currentAmount)
            }
        });
    } catch (error) {
        console.error('Error updating goal:', error);
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
        }

        await db.financialGoal.delete({
            where: {
                id,
                userId: session.user.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting goal:', error);
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }
}