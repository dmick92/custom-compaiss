import type { TRPCRouterRecord } from "@trpc/server";

import { user } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const userRouter = {
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const users = await ctx.db.query.user.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });
        return users;
    }),
} satisfies TRPCRouterRecord; 