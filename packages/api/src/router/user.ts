import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "@acme/db";
import { member, user } from "@acme/db/schema";
import { protectedProcedure } from "../trpc";

/**
 * User router
 * - getAll: existing example
 * - listByActiveOrg: returns users who are members of the active organization in the current session
 */
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

    listByActiveOrg: protectedProcedure.query(async ({ ctx }) => {
        const orgId =
            (ctx.session as any)?.session?.activeOrganizationId ||
            (ctx.session as any)?.activeOrganizationId;
        if (!orgId) {
            return [];
        }

        // fetch members for active org, then join to user
        const memberships = await ctx.db
            .select({
                userId: member.userId,
            })
            .from(member)
            .where(eq(member.organizationId, orgId));

        const ids = memberships.map((m) => m.userId);
        if (ids.length === 0) return [];

        const usersInOrg = await ctx.db.query.user.findMany({
            where: (u, { inArray }) => inArray(u.id, ids),
            columns: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });

        return usersInOrg;
    }),
} satisfies TRPCRouterRecord;