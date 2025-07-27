import { mockStrategies, mockDocuments } from '~/app/lib/mock-data';
import { Strategy, Document } from '~/types/strategy';
import StrategyDetailClient from './strategy-detail-client';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
    return mockStrategies.map((strategy) => ({
        id: strategy.id,
    }));
}

interface StrategyDetailPageProps {
    params: {
        id: string;
    };
}

export default async function StrategyDetailPage({ params }: StrategyDetailPageProps) {
    const strategyId = params.id;

    // Find strategy by ID
    const strategy = mockStrategies.find(s => s.id === strategyId);

    if (!strategy) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Strategy not found</h2>
                    <p className="text-gray-600 mb-4">The strategy you're looking for doesn't exist.</p>
                    <Link href="/strategies">
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Strategies
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Filter documents for this strategy
    const documents = mockDocuments.filter(d => d.strategyId === strategyId);

    return (
        <StrategyDetailClient
            strategy={strategy}
            initialDocuments={documents}
            strategyId={strategyId}
        />
    );
}