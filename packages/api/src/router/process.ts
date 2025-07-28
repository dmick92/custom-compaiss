import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { Process, CreateProcessSchema } from "@acme/db/schema";

import { protectedProcedure, requirePermission } from "../trpc";
import { permissions, spicedbClient } from "@acme/authz";

export const processRouter = {
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const processes = await ctx.db.query.Process.findMany();
    return processes;
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .use(requirePermission({
      resourceType: "process",
      action: "read",
      getResourceId: ({ input }) => (input as { id?: string }).id ?? "",
    }))
    .query(async ({ input, ctx }) => {
      console.log("getById", input.id);
      const process = await ctx.db.query.Process.findFirst({
        where: eq(Process.id, input.id),
      });
      if (!process) {
        throw new Error("Process not found");
      }
      return {
        id: process.id,
        name: process.name,
        flowData: process.flowData,
        createdAt: process.createdAt,
        updatedAt: process.updatedAt,
      };
    }),
  create: protectedProcedure
    .input(CreateProcessSchema)
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.session?.session.activeOrganizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

      const created = await ctx.db
        .insert(Process)
        .values({ ...input, orgId })
        .returning();
      const res = created[0];
      // Grant owner in spicedb
      if (res && ctx.session?.user?.id) {
        await permissions.process.grant.owner(
          `user:${ctx.session.user.id}`,
          `process:${res.id}`
        ).execute(spicedbClient);
      }
      return res;
    }),




  save: protectedProcedure
    .input(CreateProcessSchema)
    .use(requirePermission({
      resourceType: "process",
      action: "update",
      getResourceId: ({ input }) => (input as { id?: string }).id ?? "",
    }))
    .mutation(async ({ input, ctx }) => {
      let res = null;
      if (input.id) {
        // Update existing process
        const updated = await ctx.db
          .update(Process)
          .set(input)
          .where(eq(Process.id, input.id))
          .returning();
        res = updated[0];
      } else {
        // Create new process
        const orgId = ctx.session?.session.activeOrganizationId;
        if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

        const created = await ctx.db
          .insert(Process)
          .values({ ...input, orgId })
          .returning();
        res = created[0];

        // Grant owner in spicedb
        if (res && ctx.session?.user?.id) {
          await permissions.process.grant.owner(
            `user:${ctx.session.user.id}`,
            `process:${res.id}`
          ).execute(spicedbClient);
        }
      }
      return res;
    }),
} satisfies TRPCRouterRecord;
