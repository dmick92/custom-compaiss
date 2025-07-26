import { sql } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organization, user } from "./auth-schema";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
})

export * from "./auth-schema";

export const processStatusEnum = pgEnum("ProcessStatus", [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const Process = pgTable("process", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar({ length: 255 }).notNull().unique(),
  description: t.text(),
  status: processStatusEnum("status").notNull(),
  flowData: t.json().notNull(),
  orgId: t.text().notNull().references(() => organization.id, { onDelete: "cascade" }),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateProcessSchema = createInsertSchema(Process, { orgId: z.optional(z.never()) })

export const projectPriorityEnum = pgEnum("ProjectPriority", [
  "Lowest",
  "Low",
  "Medium",
  "High",
  "Critical",
]);

export const Project = pgTable("project", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.varchar({ length: 255 }).notNull().unique(),
  description: t.text(),
  status: processStatusEnum("status").notNull(),
  flowData: t.json().notNull(),
  priority: projectPriorityEnum("priority").notNull().default("Medium"),
  orgId: t.text().notNull().references(() => organization.id, { onDelete: "cascade" }),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateProjectSchema = createInsertSchema(Project)

export const Task = pgTable("task", (t) => ({
  id: t.uuid().defaultRandom().primaryKey(),
  projectId: t
    .uuid()
    .notNull()
    .references(() => Project.id, { onDelete: "cascade" }),
  orgId: t.text().notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: t.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  type: t.varchar({ length: 128 }).notNull(),
  data: t.json().notNull(),
  positionX: t.real(),
  positionY: t.real(),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateTaskSchema = createInsertSchema(Task)