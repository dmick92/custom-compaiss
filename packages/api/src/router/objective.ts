import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq } from "@acme/db";
import { CreateKeyResultSchema, CreateObjectiveSchema, CreatePostSchema, KeyResult, Objective, Post, UpdateObjectiveSchema } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const objectiveRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Objective.findMany();
  }),
  listWithKeyResults: publicProcedure.query(async ({ ctx }) => {
    // First get all objectives
    const objectives = await ctx.db.query.Objective.findMany();

    // For each objective, get its key results
    const objectivesWithKeyResults = await Promise.all(
      objectives.map(async (objective) => {
        const keyResults = await ctx.db.query.KeyResult.findMany({
          where: eq(KeyResult.objectiveId, objective.id),
        });
        return {
          ...objective,
          keyResults,
        };
      })
    );

    return objectivesWithKeyResults;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Objective.findFirst({
        where: eq(Objective.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateObjectiveSchema.extend({
      keyResults: z.array(CreateKeyResultSchema.omit({ objectiveId: true })),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.session?.session.activeOrganizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

      const [objective] = await ctx.db.insert(Objective).values({ ...input, orgId }).returning();
      if (!objective) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to create objective" });
      const keyResults = await ctx.db.insert(KeyResult).values(input.keyResults.map(kr => ({ ...kr, objectiveId: objective.id })));
      return { objective, keyResults };
    }),

  update: protectedProcedure
    .input(UpdateObjectiveSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.session?.session.activeOrganizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

      const { id, keyResults, orgId: _ignore, ...updateData } = input;

      // ✅ Remove undefined fields so we don't overwrite defaults
      const cleanUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      // ✅ Run in a transaction to ensure atomicity
      const result = await ctx.db.transaction(async (tx) => {
        // Update objective
        const [objective] = await tx
          .update(Objective)
          .set({ ...cleanUpdate, updatedAt: new Date() }) // ensure updatedAt always updates
          .where(eq(Objective.id, id))
          .returning();

        if (!objective) throw new TRPCError({ code: "BAD_REQUEST", message: "Objective not found" });

        let newKeyResults = [];

        if (keyResults) {
          // ✅ Delete old key results and insert new ones
          await tx.delete(KeyResult).where(eq(KeyResult.objectiveId, id));
          if (keyResults.length > 0) {
            newKeyResults = await tx.insert(KeyResult)
              .values(keyResults.map((kr) => ({ ...kr, objectiveId: id })))
              .returning();
          }
        }

        return { objective, keyResults: newKeyResults };
      });

      return result;
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Objective).where(eq(Objective.id, input));
  }),
} satisfies TRPCRouterRecord;
