"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { authClient } from "~/auth/client"
import { ThemeProvider } from "./_components/theme-provider"
import { Toaster } from "~/components/ui/sonner"
import { TRPCReactProvider } from "~/trpc/react"

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>
                <AuthUIProvider
                    authClient={authClient}
                    navigate={router.push}
                    replace={router.replace}
                    onSessionChange={() => {
                        // Clear router cache (protected routes)
                        router.refresh()
                    }}
                    Link={Link}
                    organization={{}}
                    settings={{
                        url: "/settings",
                    }}
                >
                    {children}
                </AuthUIProvider>
                <Toaster />
            </TRPCReactProvider>
        </ThemeProvider>
    )
}