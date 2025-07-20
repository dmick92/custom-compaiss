import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { Process, Project, Task } from "@acme/db/schema";

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
    .input(z.object({
      processId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const process = await ctx.db.query.Process.findFirst({
        where: eq(Process.id, input.processId),
      });
      if (!process) {
        throw new Error("Process not found");
      }
      // Create the project
      const projectArr = await ctx.db.insert(Project).values({
        name: input.name || process.name,
        description: input.description || process.description,
        flowData: process.flowData,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      const project = projectArr?.[0];
      if (!project) {
        throw new Error("Project creation failed");
      }
      // Type guard for nodes
      type NodeType = { type: string; data: any; position?: { x?: number; y?: number } };
      let nodes: NodeType[] = [];
      if (process.flowData && typeof process.flowData === 'object' && Array.isArray((process.flowData as any).nodes)) {
        nodes = (process.flowData as { nodes: NodeType[] }).nodes;
      }
      const tasksToInsert: {
        projectId: string;
        type: string;
        data: any;
        positionX: number | null;
        positionY: number | null;
        createdAt: Date;
        updatedAt: Date;
      }[] = nodes.map((node) => ({
        projectId: project.id,
        type: node.type,
        data: node.data,
        positionX: node.position?.x ?? null,
        positionY: node.position?.y ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      let createdTasks: typeof tasksToInsert = [];
      if (tasksToInsert.length > 0) {
        createdTasks = await ctx.db.insert(Task).values(tasksToInsert).returning();
      }
      return { project, tasks: createdTasks };
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
        name: z.string(),
        flowData: z.any(), // expects {nodes, edges, ...}
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let res = null;
      if (input.id) {
        // Update existing project
        const updated = await ctx.db
          .update(Project)
          .set({
            name: input.name,
            flowData: input.flowData,
            updatedAt: new Date(),
          })
          .where(eq(Project.id, input.id))
          .returning();
        res = updated[0];
      } else {
        // Create new project
        const created = await ctx.db
          .insert(Project)
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
