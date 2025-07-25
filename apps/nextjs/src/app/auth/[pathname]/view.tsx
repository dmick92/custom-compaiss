"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"

export function AuthView({ pathname }: { pathname: string }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md p-6">
                <AuthCard pathname={pathname} />
            </div>
        </main>
    );
}