"use client";

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import '@univerjs/preset-sheets-core/lib/index.css'
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

interface SpreadsheetPageProps {
    params: Promise<{ id: string }>;
}

export default function SpreadsheetPage({ params }: SpreadsheetPageProps) {
    const { id: strategyId } = use(params);
    const { theme, resolvedTheme } = useTheme();
    const univerRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    // Handle hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Determine the actual theme to use
        const isDark = resolvedTheme === 'dark';

        // Initialize Univer Docs with current theme
        const { univer, univerAPI } = createUniver({
            locale: LocaleType.EN_US,
            locales: {
                [LocaleType.EN_US]: merge(
                    {},
                    UniverPresetSheetsCoreEnUS,
                ),
            },
            darkMode: isDark,
            presets: [
                UniverSheetsCorePreset({
                    container: 'app',
                }),
            ],
        });

        // Create a Univer document
        univerAPI.createWorkbook({});

        // Cleanup function
    }, [mounted, resolvedTheme]); // Use resolvedTheme instead of theme

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="container mx-auto space-y-6 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Link href={`/plan/strategies/${strategyId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Strategy
                        </Button>
                    </Link>
                </div>
                <h1 className="text-2xl font-bold">Strategy Spreadsheet</h1>
                <div id="app" className="w-full h-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Link href={`/plan/strategies/${strategyId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Strategy
                    </Button>
                </Link>
            </div>

            <h1 className="text-2xl font-bold">Strategy Spreadsheet</h1>
            <div id="app" className="w-full h-full" />
        </div>
    );
}
