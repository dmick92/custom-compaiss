import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { headers } from "next/headers";
import type { Auth } from "@acme/auth";

import type { AppRouter } from "./root";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Helper function to create a tRPC caller for server-side usage
 * @example
 * const caller = await createCaller(auth)
 * const tasks = await caller.task.list()
 */
export async function createCaller(auth: Auth) {
    const heads = await headers();
    //heads.set("x-trpc-source", "rsc");

    const ctx = await createTRPCContext({
        headers: heads,
        auth,
    });

    return appRouter.createCaller(ctx);
}

export { createTRPCContext, appRouter };
export type { AppRouter, RouterInputs, RouterOutputs };
