// src/app/api/analytics/route.ts
// Analytics with smart merchant-based categorization

import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { auth } from '~/server/auth';

interface AnalyticsData {
    accounts: Array<{
        id: string;
        accountName: string;
        bankName: string;
        accountType: string;
        currentBalance: number;
        mask: string;
    }>;
    transactions: Array<{
        id: string;
        amount: number;
        description: string;
        merchantName?: string;
        category: string;
        subcategory?: string;
        date: string;
        bankAccount?: {
            accountName: string;
            bankName: string;
        };
    }>;
    metrics: {
        totalBalance: number;
        totalIncome: number;
        totalExpenses: number;
        netCashFlow: number;
        savingsRate: number;
        transactionCount: number;
    };
    chartData: {
        categoryBreakdown: Array<{
            name: string;
            value: number;
            emoji: string;
            fill: string;
            transactions: number;
        }>;
        dailyData: Array<{
            date: string;
            income: number;
            expenses: number;
            net: number;
        }>;
    };
}

export async function GET(req: NextRequest) {
    try {
        console.log('📊 Analytics API called');

        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('✅ User authenticated:', session.user.id);

        // Get timeframe from query params (default to 30 days)
        const { searchParams } = new URL(req.url);
        const timeframe = parseInt(searchParams.get('timeframe') || '30');

        console.log('🕒 Timeframe:', timeframe, 'days');

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);

        console.log('📅 Date range:', startDate.toISOString(), 'to', now.toISOString());

        // Fetch user's bank accounts and transactions in parallel
        const [accounts, transactions] = await Promise.all([
            // Fetch active bank accounts
            db.bankAccount.findMany({
                where: {
                    userId: session.user.id,
                    isActive: true,
                },
                select: {
                    id: true,
                    accountName: true,
                    bankName: true,
                    accountType: true,
                    currentBalance: true,
                    mask: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),

            // Fetch transactions within timeframe
            db.transaction.findMany({
                where: {
                    userId: session.user.id,
                    date: {
                        gte: startDate,
                        lte: now,
                    },
                },
                include: {
                    bankAccount: {
                        select: {
                            accountName: true,
                            bankName: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            }),
        ]);

        console.log('📊 Data fetched:', {
            accounts: accounts.length,
            transactions: transactions.length,
        });

        // Process and calculate analytics
        const analyticsData = processAnalyticsData(accounts, transactions, timeframe);

        console.log('✅ Analytics data processed:', {
            totalBalance: analyticsData.metrics.totalBalance,
            transactionCount: analyticsData.metrics.transactionCount,
            netCashFlow: analyticsData.metrics.netCashFlow,
            categoriesFound: analyticsData.chartData.categoryBreakdown.length,
            categoryBreakdown: analyticsData.chartData.categoryBreakdown.map(c => `${c.name}: $${c.value.toFixed(2)}`)
        });

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error('❌ Error in analytics API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}

// 🧠 Smart categorization based on merchant names and descriptions
function smartCategorizeTransaction(merchantName?: string, description?: string): string {
    const text = `${merchantName || ''} ${description || ''}`.toLowerCase();

    // Food & Dining
    if (text.match(/mcdonalds|mcdonald's|burger king|subway|starbucks|dunkin|pizza|restaurant|cafe|coffee|food|dining|chipotle|taco bell|kfc|wendy's|domino|papa john|thai|chinese|mexican|italian|sushi|bbq|grill|bistro|eatery|diner|buffet|bakery|delicatessen|deli/)) {
        return 'Food & Dining';
    }

    // Groceries
    if (text.match(/walmart|target|kroger|safeway|whole foods|trader joe|costco|sam's club|aldi|publix|grocery|supermarket|market|fresh|organic/)) {
        return 'Groceries';
    }

    // Transportation
    if (text.match(/shell|exxon|chevron|bp|mobil|gas|fuel|uber|lyft|taxi|parking|metro|bus|train|airline|flight|car rental|hertz|enterprise|avis|auto|mechanic|oil change|registration|dmv|toll/)) {
        return 'Transportation';
    }

    // Shopping
    if (text.match(/amazon|ebay|etsy|best buy|apple store|microsoft|nike|adidas|clothing|apparel|shoes|electronics|furniture|home depot|lowes|ikea|bed bath|macy|nordstrom|gap|zara|h&m|store|shop|retail|mall/)) {
        return 'Shopping';
    }

    // Entertainment
    if (text.match(/netflix|spotify|hulu|disney|prime video|youtube|gaming|xbox|playstation|nintendo|steam|movie|cinema|theater|concert|sports|gym|fitness|recreation|entertainment|amusement|ticket/)) {
        return 'Entertainment';
    }

    // Bills & Utilities
    if (text.match(/electric|electricity|gas bill|water|sewer|internet|cable|phone|wireless|verizon|at&t|t-mobile|sprint|comcast|xfinity|directv|utility|bill payment|service charge/)) {
        return 'Bills & Utilities';
    }

    // Healthcare
    if (text.match(/pharmacy|cvs|walgreens|rite aid|hospital|medical|doctor|dentist|clinic|health|insurance|medicare|medicaid|prescription|rx|urgent care/)) {
        return 'Healthcare';
    }

    // Banking & Finance
    if (text.match(/bank|atm|fee|transfer|payment|credit card|loan|mortgage|interest|finance|investment|deposit|withdrawal|check/)) {
        return 'Banking & Finance';
    }

    // Income/Payroll
    if (text.match(/payroll|salary|wage|income|deposit|direct deposit|employer|company pay/)) {
        return 'Income';
    }

    // Subscriptions
    if (text.match(/subscription|monthly|recurring|membership|adobe|microsoft 365|office|icloud|dropbox|premium|pro account/)) {
        return 'Subscriptions';
    }

    // Travel
    if (text.match(/hotel|airbnb|booking|expedia|travel|vacation|resort|lodge|inn|motel|trip|flight|airline|rental car/)) {
        return 'Travel';
    }

    // Personal Care
    if (text.match(/salon|barber|spa|beauty|cosmetic|nail|hair|massage|personal care|grooming/)) {
        return 'Personal Care';
    }

    // Default fallback
    return 'Other';
}

function processAnalyticsData(accounts: any[], transactions: any[], timeframe: number): AnalyticsData {
    console.log('🔄 Processing analytics data with smart categorization...');

    // Convert Decimal/Prisma types to numbers and apply smart categorization
    const processedAccounts = accounts.map(account => ({
        ...account,
        currentBalance: Number(account.currentBalance),
    }));

    const processedTransactions = transactions.map(transaction => {
        // 🧠 Use smart categorization instead of database category
        const smartCategory = smartCategorizeTransaction(transaction.merchantName, transaction.description);

        return {
            id: transaction.id,
            amount: Number(transaction.amount),
            description: transaction.description,
            merchantName: transaction.merchantName,
            category: smartCategory, // Use smart category instead of "Other"
            subcategory: transaction.subcategory,
            date: transaction.date.toISOString(),
            bankAccount: transaction.bankAccount,
        };
    });

    // Calculate basic metrics
    const totalBalance = processedAccounts.reduce((sum, account) => sum + account.currentBalance, 0);

    const expenses = processedTransactions.filter(t => t.amount < 0);
    const income = processedTransactions.filter(t => t.amount > 0);

    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Process category breakdown using smart categories
    const categoryTotals = expenses.reduce((acc, transaction) => {
        const category = transaction.category;

        if (!acc[category]) {
            acc[category] = { amount: 0, transactions: 0 };
        }
        acc[category].amount += Math.abs(transaction.amount);
        acc[category].transactions += 1;
        return acc;
    }, {} as { [key: string]: { amount: number; transactions: number } });

    // Category emojis for smart categories
    const getCategoryEmoji = (category: string): string => {
        const emojiMap: { [key: string]: string } = {
            'Food & Dining': '🍔',
            'Groceries': '🛒',
            'Transportation': '🚗',
            'Shopping': '🛍️',
            'Entertainment': '🎬',
            'Bills & Utilities': '💡',
            'Healthcare': '🏥',
            'Banking & Finance': '🏦',
            'Income': '💰',
            'Subscriptions': '📱',
            'Travel': '✈️',
            'Personal Care': '💅',
            'Other': '💳'
        };

        return emojiMap[category] || '💰';
    };

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

    const categoryBreakdown = Object.entries(categoryTotals)
        .map(([category, data], index) => ({
            name: category,
            value: data.amount,
            emoji: getCategoryEmoji(category),
            fill: colors[index % colors.length],
            transactions: data.transactions,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    // Process daily data for chart
    const dailyData = generateDailyData(processedTransactions, timeframe);

    console.log('✅ Smart categorization complete:', {
        categories: categoryBreakdown.length,
        categoriesFound: categoryBreakdown.map(c => `${c.name} (${c.emoji}): $${c.value.toFixed(2)} (${c.transactions} transactions)`),
        dailyDataPoints: dailyData.length,
        totalBalance,
        netCashFlow,
    });

    return {
        accounts: processedAccounts,
        transactions: processedTransactions,
        metrics: {
            totalBalance,
            totalIncome,
            totalExpenses,
            netCashFlow,
            savingsRate,
            transactionCount: processedTransactions.length,
        },
        chartData: {
            categoryBreakdown,
            dailyData,
        },
    };
}

function generateDailyData(transactions: any[], timeframe: number) {
    // Generate array of dates for the timeframe
    const days = Math.min(timeframe, 30); // Limit to 30 days for daily view
    const dailyArray = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
    });

    return dailyArray.map(date => {
        const dayTransactions = transactions.filter(t =>
            t.date.split('T')[0] === date
        );

        const dayIncome = dayTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const dayExpenses = dayTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
            date: new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }),
            income: dayIncome,
            expenses: dayExpenses,
            net: dayIncome - dayExpenses,
        };
    });
}