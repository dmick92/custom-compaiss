import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { Process, Project, CreateProjectSchema } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const projectRouter = {
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.query.Project.findMany();
    return projects;
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const project = await ctx.db.query.Project.findFirst({
        where: eq(Project.id, input.id),
      });
      if (!project) {
        throw new Error("Project not found");
      }
      return {
        id: project.id,
        name: project.name,
        flowData: project.flowData,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    }),
  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(async ({ input, ctx }) => {
      const parsed = CreateProjectSchema.parse(input);
      // Create the project
      const projectArr = await ctx.db.insert(Project).values({
        ...parsed,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      const project = projectArr?.[0];
      if (!project) {
        throw new Error("Project creation failed");
      }
      return { project };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(Project).where(eq(Project.id, input.id));
    }),
  save: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        data: CreateProjectSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      let res = null;
      if (input.id) {
        // Update existing project
        const parsed = CreateProjectSchema.parse(input.data);
        const updated = await ctx.db
          .update(Project)
          .set({
            ...parsed,
            updatedAt: new Date(),
          })
          .where(eq(Project.id, input.id))
          .returning();
        res = updated[0];
      } else {
        // Create new project
        const parsed = CreateProjectSchema.parse(input.data);
        const created = await ctx.db
          .insert(Project)
          .values({
            ...parsed,
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
