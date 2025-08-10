import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq } from "@acme/db";
import { UserPreferences, member, organization, user } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

/**
 * Organization router
 * - byId: public fetch by id
 * - setActive: protected; verifies membership, sets Better‑Auth active organization for the session, persists last-used org
 * - myMemberships: protected; list organizations the current user belongs to (for client pickers)
 */
export const organizationRouter = {
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.organization.findFirst({
        where: eq(organization.id, input.id),
      });
    }),

  myMemberships: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const memberships = await ctx.db
      .select()
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.userId, userId));
    return memberships;
  }),

  members: protectedProcedure.query(async ({ ctx }) => {
    const orgId =
      (ctx.session as any)?.activeOrganizationId ||
      (ctx.session as any)?.session?.activeOrganizationId;
    const members = await ctx.db.select().from(member).innerJoin(user, eq(member.userId, user.id)).where(eq(member.organizationId, orgId));
    return members;
  }),

  setActive: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user is a member of the organization
      const isMember = await ctx.db.query.member.findFirst({
        where: and(eq(member.userId, userId), eq(member.organizationId, input.organizationId)),
      });

      if (!isMember) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organization" });
      }

      // Use Better‑Auth server SDK from context
      const setActive = (ctx as any).auth?.organization?.setActiveOrganization as
        | ((args: { userId: string; organizationId: string }) => Promise<void>)
        | undefined;

      if (!setActive) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Better‑Auth server SDK not available in tRPC context as ctx.auth.organization.setActiveOrganization",
        });
      }

      await setActive({ userId, organizationId: input.organizationId });

      // Persist last-used organization in preferences
      const pref = await ctx.db.query.UserPreferences.findFirst?.({
        where: eq(UserPreferences.userId, userId),
      }).catch(() => null as any);

      if (pref) {
        await ctx.db
          .update(UserPreferences)
          .set({ lastOrganizationId: input.organizationId })
          .where(eq(UserPreferences.userId, userId));
      } else {
        await ctx.db.insert(UserPreferences).values({
          userId,
          lastOrganizationId: input.organizationId,
        });
      }

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
