import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// import { cn } from "@acme/ui";
// import { ThemeProvider } from "@acme/ui/theme";
// import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";
import { cn } from "~/lib/utils";
import { Providers } from "../providers";
import Header from "../_components/header";

export const metadata: Metadata = {
    metadataBase: new URL(
        env.VERCEL_ENV === "production"
            ? "https://turbo.t3.gg"
            : "http://localhost:3000",
    ),
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",
    openGraph: {
        title: "Create T3 Turbo",
        description: "Simple monorepo with shared backend for web & mobile apps",
        url: "https://create-t3-turbo.vercel.app",
        siteName: "Create T3 Turbo",
    },
    twitter: {
        card: "summary_large_image",
        site: "@jullerino",
        creator: "@jullerino",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
};

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export default function AuthLayout(props: { children: React.ReactNode }) {
    return (
        <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            {props.children}
        </div>
    );
}
