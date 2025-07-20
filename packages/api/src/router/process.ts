import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { Process } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const processRouter = {
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const processes = await ctx.db.query.Process.findMany();
    return processes;
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
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
  save: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        name: z.string(),
        flowData: z.any(), // expects {nodes, edges, ...}
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let res = null;
      if (input.id) {
        // Update existing process
        const updated = await ctx.db
          .update(Process)
          .set({
            name: input.name,
            flowData: input.flowData,
            updatedAt: new Date(),
          })
          .where(eq(Process.id, input.id))
          .returning();
        res = updated[0];
      } else {
        // Create new process
        const created = await ctx.db
          .insert(Process)
          .values({
            name: input.name,
            flowData: input.flowData,
            status: "DRAFT",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        res = created[0];
      }

      return res;
    }),
} satisfies TRPCRouterRecord;
