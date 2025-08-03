/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod/v4";

import type { Auth } from "@acme/auth";
import { db } from "@acme/db/client";
import { permissions, spicedbClient } from "@acme/authz";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: Auth;
}) => {
  // Prefer server SDK instance for org ops; keep api for getSession
  const auth = opts.auth;
  const authApi = auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });
  return {
    auth,     // expose full server SDK instance for routers (organization ops)
    authApi,  // keep api wrapper for existing usages (getSession, etc.)
    session,
    db,
  };
};
/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Permission middleware for tRPC
 * @param resourceType - e.g. 'process', 'project', 'task'
 * @param action - e.g. 'view', 'edit', 'manage'
 * @param getResourceId - function to extract resource id from input/context
 */
export function requirePermission<
  ResourceType extends keyof typeof permissions,
  Action extends keyof (typeof permissions[ResourceType]["check"])
>({
  resourceType,
  action,
  getResourceId,
}: {
  resourceType: ResourceType;
  action: Action;
  getResourceId: (opts: { input: unknown; ctx: any }) => string;
}) {
  return t.middleware(async (opts) => {
    const { ctx, input, next } = opts;
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const resourceId = getResourceId({ input, ctx });
    const checkFns = permissions[resourceType].check as Record<string, (subject: string, resource: string) => { execute: (client: any) => Promise<boolean> }>;
    const checkFn = checkFns[action as string];
    if (!checkFn) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Permission check not implemented for ${String(resourceType)}.${String(action)}` });
    }
    const allowed = await checkFn(`user:${userId}`, `${resourceType}:${resourceId}`).execute(spicedbClient);
    if (!allowed) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next();
  });
}
