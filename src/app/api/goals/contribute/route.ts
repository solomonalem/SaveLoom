// Create src/app/api/goals/contribute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { goalId, amount, sourceAccountId, note } = await req.json();

        if (!goalId || !amount || !sourceAccountId) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['goalId', 'amount', 'sourceAccountId']
            }, { status: 400 });
        }

        const numericAmount = parseFloat(amount);
        if (numericAmount <= 0) {
            return NextResponse.json({
                error: 'Amount must be positive'
            }, { status: 400 });
        }

        // Verify goal ownership
        const goal = await db.financialGoal.findFirst({
            where: {
                id: goalId,
                userId: session.user.id
            }
        });

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        // Verify account ownership
        const account = await db.bankAccount.findFirst({
            where: {
                id: sourceAccountId,
                userId: session.user.id
            }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Create contribution record
        const contribution = await db.goalContribution.create({
            data: {
                userId: session.user.id,
                goalId,
                amount: numericAmount,
                sourceType: 'manual',
                sourceAccountId,
                note: note || null
            }
        });

        // Update goal current amount
        const updatedGoal = await db.financialGoal.update({
            where: { id: goalId },
            data: {
                currentAmount: {
                    increment: numericAmount
                }
            }
        });

        // Check if goal is now completed
        if (Number(updatedGoal.currentAmount) >= Number(updatedGoal.targetAmount) && !updatedGoal.isCompleted) {
            await db.financialGoal.update({
                where: { id: goalId },
                data: {
                    isCompleted: true,
                    completedDate: new Date()
                }
            });
        }

        return NextResponse.json({
            success: true,
            contribution,
            updatedGoal: {
                ...updatedGoal,
                targetAmount: Number(updatedGoal.targetAmount),
                currentAmount: Number(updatedGoal.currentAmount)
            }
        });

    } catch (error) {
        console.error('Error adding contribution:', error);
        return NextResponse.json({
            error: 'Failed to add contribution'
        }, { status: 500 });
    }
}

// Get contribution history for a goal
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const goalId = searchParams.get('goalId');

        if (!goalId) {
            return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
        }

        const contributions = await db.goalContribution.findMany({
            where: {
                goalId,
                userId: session.user.id
            },
            orderBy: {
                contributedAt: 'desc'
            },
            include: {
                transaction: true
            }
        });

        return NextResponse.json({
            contributions: contributions.map(c => ({
                ...c,
                amount: Number(c.amount)
            }))
        });

    } catch (error) {
        console.error('Error fetching contributions:', error);
        return NextResponse.json({
            error: 'Failed to fetch contributions'
        }, { status: 500 });
    }
}