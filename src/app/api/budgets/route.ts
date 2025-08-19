// src/app/api/budgets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function GET(req: NextRequest) {
    try {
        console.log('🔍 GET /api/budgets - Starting...');

        const session = await auth();
        console.log('👤 Session:', session?.user?.id ? 'Found' : 'Not found');

        if (!session?.user?.id) {
            console.log('❌ Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('📊 Fetching budgets for user:', session.user.id);

        // Get user's budgets with calculated spending
        const budgets = await db.budget.findMany({
            where: {
                userId: session.user.id,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`📋 Found ${budgets.length} budgets in database`);

        // Calculate actual spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                try {
                    console.log(`💰 Calculating spending for budget: ${budget.category}`);

                    // Get transactions in the budget period for this category
                    const transactions = await db.transaction.findMany({
                        where: {
                            userId: session.user.id,
                            category: budget.category,
                            amount: {
                                lt: 0 // Only expenses (negative amounts)
                            },
                            date: {
                                gte: new Date(budget.startDate),
                                lte: new Date(budget.endDate || new Date())
                            }
                        }
                    });

                    const spent = transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
                    const remaining = Number(budget.amount) - spent;

                    console.log(`📊 Budget ${budget.category}: $${spent} spent of $${Number(budget.amount)}`);

                    return {
                        ...budget,
                        spent,
                        remaining,
                        amount: Number(budget.amount)
                    };
                } catch (error) {
                    console.error(`❌ Error calculating spending for budget ${budget.id}:`, error);
                    return {
                        ...budget,
                        spent: 0,
                        remaining: Number(budget.amount),
                        amount: Number(budget.amount)
                    };
                }
            })
        );

        console.log('✅ Successfully processed all budgets');

        return NextResponse.json({
            budgets: budgetsWithSpending,
            count: budgetsWithSpending.length
        });

    } catch (error) {
        console.error('❌ GET /api/budgets error:', error);
        return NextResponse.json({
            error: 'Failed to fetch budgets',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('➕ POST /api/budgets - Starting...');

        const session = await auth();
        console.log('👤 Session:', session?.user?.id ? 'Found' : 'Not found');

        if (!session?.user?.id) {
            console.log('❌ Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('📝 Request body:', body);

        const { category, amount, period, startDate, endDate } = body;

        // Validate required fields
        if (!category || !amount || !period || !startDate || !endDate) {
            console.log('❌ Missing required fields:', { category, amount, period, startDate, endDate });
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['category', 'amount', 'period', 'startDate', 'endDate'],
                received: { category, amount, period, startDate, endDate }
            }, { status: 400 });
        }

        // Validate amount
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            console.log('❌ Invalid amount:', amount);
            return NextResponse.json({
                error: 'Amount must be a positive number'
            }, { status: 400 });
        }

        console.log('🔍 Checking for existing budget...');

        // Check if budget already exists for this category and period
        const existingBudget = await db.budget.findFirst({
            where: {
                userId: session.user.id,
                category,
                isActive: true,
                startDate: {
                    lte: new Date(endDate)
                },
                endDate: {
                    gte: new Date(startDate)
                }
            }
        });

        if (existingBudget) {
            console.log('❌ Budget already exists:', existingBudget.id);
            return NextResponse.json({
                error: `Budget already exists for ${category} in this period`
            }, { status: 400 });
        }

        console.log('💾 Creating new budget...');

        // Create new budget
        const budget = await db.budget.create({
            data: {
                userId: session.user.id,
                category,
                amount: numericAmount,
                period,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: true
            }
        });

        console.log('✅ Budget created:', budget.id);

        // Calculate initial spending
        console.log('💰 Calculating initial spending...');

        const transactions = await db.transaction.findMany({
            where: {
                userId: session.user.id,
                category: budget.category,
                amount: {
                    lt: 0
                },
                date: {
                    gte: new Date(budget.startDate),
                    lte: new Date(budget.endDate || new Date())
                }
            }
        });

        const spent = transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        console.log(`📊 Initial spending calculated: $${spent}`);

        const budgetWithSpending = {
            ...budget,
            spent,
            remaining: Number(budget.amount) - spent,
            amount: Number(budget.amount)
        };

        console.log('✅ POST /api/budgets completed successfully');

        return NextResponse.json({
            success: true,
            budget: budgetWithSpending,
            message: 'Budget created successfully'
        });

    } catch (error) {
        console.error('❌ POST /api/budgets error:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });

        return NextResponse.json({
            error: 'Failed to create budget',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        console.log('✏️ PUT /api/budgets - Starting...');

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('📝 Update request body:', body);

        const { id, category, amount, period, startDate, endDate } = body;

        if (!id) {
            return NextResponse.json({
                error: 'Budget ID required'
            }, { status: 400 });
        }

        // Verify budget ownership
        const existingBudget = await db.budget.findFirst({
            where: {
                id,
                userId: session.user.id
            }
        });

        if (!existingBudget) {
            return NextResponse.json({
                error: 'Budget not found'
            }, { status: 404 });
        }

        // Update budget
        const updatedBudget = await db.budget.update({
            where: { id },
            data: {
                category: category || existingBudget.category,
                amount: amount ? parseFloat(amount) : existingBudget.amount,
                period: period || existingBudget.period,
                startDate: startDate ? new Date(startDate) : existingBudget.startDate,
                endDate: endDate ? new Date(endDate) : existingBudget.endDate
            }
        });

        // Recalculate spending
        const transactions = await db.transaction.findMany({
            where: {
                userId: session.user.id,
                category: updatedBudget.category,
                amount: {
                    lt: 0
                },
                date: {
                    gte: new Date(updatedBudget.startDate),
                    lte: new Date(updatedBudget.endDate || new Date())
                }
            }
        });

        const spent = transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

        console.log('✅ Budget updated successfully');

        return NextResponse.json({
            success: true,
            budget: {
                ...updatedBudget,
                spent,
                remaining: Number(updatedBudget.amount) - spent,
                amount: Number(updatedBudget.amount)
            }
        });

    } catch (error) {
        console.error('❌ PUT /api/budgets error:', error);
        return NextResponse.json({
            error: 'Failed to update budget',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        console.log('🗑️ DELETE /api/budgets - Starting...');

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                error: 'Budget ID required'
            }, { status: 400 });
        }

        // Verify budget ownership and delete
        const deletedBudget = await db.budget.deleteMany({
            where: {
                id,
                userId: session.user.id
            }
        });

        if (deletedBudget.count === 0) {
            return NextResponse.json({
                error: 'Budget not found'
            }, { status: 404 });
        }

        console.log('✅ Budget deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Budget deleted successfully'
        });

    } catch (error) {
        console.error('❌ DELETE /api/budgets error:', error);
        return NextResponse.json({
            error: 'Failed to delete budget',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}