import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq, desc, and } from "@acme/db";
import { Task, Project, user } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { permissions, spicedbClient } from "@acme/authz";

export const taskRouter = {
  list: protectedProcedure.query(({ ctx }) => {
    const orgId = ctx.session?.session.activeOrganizationId;
    if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

    return ctx.db
      .select()
      .from(Task)
      .innerJoin(Project, eq(Task.projectId, Project.id))
      .innerJoin(user, eq(Task.userId, user.id))
      .where(and(eq(Task.orgId, orgId), eq(Project.orgId, orgId)))
      .orderBy(desc(Project.priority), desc(Project.createdAt), desc(Task.createdAt));
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Task.findFirst({
        where: eq(Task.id, input.id),
      });
    }),
} satisfies TRPCRouterRecord;
