// apps/nextjs/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

/**
 * Build the full list of public routes, including:
 *  • Better‑Auth API
 *  • Next.js internals
 *  • All of your /auth/* UI pages (prefixed)
 *  • favicon.ico
 */
const PUBLIC_PATHS = [
    "/api/auth",
    "/api/auth/:path*",
    "/_next/static/:path*",
    "/_next/image/:path*",
    "/favicon.ico",
    // prefix each view path with /auth
    ...Object.values(authViewPaths).map((p) => `/auth${p}`),
];

/** Does this pathname match any of our PUBLIC_PATHS? */
function isPublicPath(pathname: string): boolean {
    const cleanPath = pathname.replace(/\/$/, "");

    return PUBLIC_PATHS.some((route) => {
        if (route.endsWith("/:path*")) {
            const base = route.replace("/:path*", "");
            return cleanPath.startsWith(base);
        }
        return cleanPath === route.replace(/\/$/, "");
    });
}


export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("better-auth.session_token")?.value;

    // 1️⃣ Public routes always allowed
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // 2️⃣ No session? Redirect to sign-in (preserve returnTo)
    if (!token) {
        if (pathname === `/auth${authViewPaths.SIGN_IN}`) {
            return NextResponse.next();
        }
        const signInUrl = req.nextUrl.clone();
        signInUrl.pathname = `/auth/${authViewPaths.SIGN_IN}`;
        signInUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // 3️⃣ Authenticated -> all good
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/*).*)"],
};