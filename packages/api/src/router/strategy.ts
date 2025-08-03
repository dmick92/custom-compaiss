import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, desc, eq } from "@acme/db";
import { Strategy, CreateProcessSchema, processStatusEnum, projectPriorityEnum } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

/**
 * Zod schemas for Strategy CRUD using drizzle-zod-style fields from db/schema.ts
 * We can't import a prebuilt CreateStrategySchema, so we derive minimal shapes here.
 */
const CreateStrategySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    priority: z.enum(["Lowest", "Low", "Medium", "High", "Critical"]).default("Medium"),
    processId: z.string().uuid().optional().nullable(),
    ownerUserId: z.string().optional().nullable(),
});

const UpdateStrategySchema = CreateStrategySchema.partial().extend({
    id: z.string().uuid(),
});

export const strategyRouter = {
    list: protectedProcedure.query(async ({ ctx }) => {
        const orgId =
            (ctx.session as any)?.session?.activeOrganizationId ||
            (ctx.session as any)?.activeOrganizationId;
        if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

        const strategies = await ctx.db.query.Strategy.findMany({
            where: eq(Strategy.orgId, orgId),
            orderBy: desc(Strategy.createdAt),
        });
        return strategies;
    }),

    byId: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const strategy = await ctx.db.query.Strategy.findFirst({
                where: eq(Strategy.id, input.id),
            });
            if (!strategy) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Strategy not found" });
            }
            return strategy;
        }),

    create: protectedProcedure
        .input(CreateStrategySchema)
        .mutation(async ({ ctx, input }) => {
            const orgId =
                (ctx.session as any)?.session?.activeOrganizationId ||
                (ctx.session as any)?.activeOrganizationId;
            if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No active organization" });

            const created = await ctx.db
                .insert(Strategy)
                .values({
                    name: input.name,
                    description: input.description,
                    status: input.status,
                    priority: input.priority,
                    processId: input.processId ?? null,
                    ownerUserId: (input.ownerUserId ?? null) as string | null,
                    orgId,
                })
                .returning();
            return created[0];
        }),

    update: protectedProcedure
        .input(UpdateStrategySchema)
        .mutation(async ({ ctx, input }) => {
            const { id, ...rest } = input;

            // filter out undefined so we don't overwrite unintentionally
            const cleanUpdate = Object.fromEntries(Object.entries(rest).filter(([_, v]) => v !== undefined));

            const updated = await ctx.db
                .update(Strategy)
                .set({ ...cleanUpdate, updatedAt: new Date() })
                .where(eq(Strategy.id, id))
                .returning();

            const res = updated[0];
            if (!res) throw new TRPCError({ code: "BAD_REQUEST", message: "Update failed" });
            return res;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(Strategy).where(eq(Strategy.id, input.id));
            return { success: true };
        }),
} satisfies TRPCRouterRecord;