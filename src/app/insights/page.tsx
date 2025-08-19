
import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';
import AIInsightsDashboard from '~/app/_components/AIInsightsDashboard';

export default async function InsightsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/api/auth/signin');
    }

    return <AIInsightsDashboard />;
}