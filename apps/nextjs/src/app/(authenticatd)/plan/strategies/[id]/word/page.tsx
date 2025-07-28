"use client";

import { use, useEffect, useRef, useState } from "react";
import { createUniver, LocaleType, merge } from "@univerjs/presets";
import { UniverDocsCorePreset } from "@univerjs/preset-docs-core";
import UniverPresetDocsCoreEnUS from "@univerjs/preset-docs-core/locales/en-US";
import "@univerjs/preset-docs-core/lib/index.css";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";

interface DocumentPageProps {
    params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const { id: strategyId } = use(params);
    const [mounted, setMounted] = useState(false);
    const univerRef = useRef<any>(null);

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
                [LocaleType.EN_US]: merge({}, UniverPresetDocsCoreEnUS),
            },
            darkMode: isDark,
            presets: [
                UniverDocsCorePreset({
                    container: 'app',
                }),
            ],
        });

        // Create a Univer document
        univerAPI.createUniverDoc({});

    }, [mounted, resolvedTheme]);

    const handleBackToStrategy = () => {
        router.back();
    };

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
                <h1 className="text-2xl font-bold">Strategy Document</h1>
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

            <h1 className="text-2xl font-bold">Strategy Document</h1>
            <div id="app" className="w-full h-full" />
        </div>
    );
}
