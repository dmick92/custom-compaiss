import { pgEnum, pgTable, uuid, timestamp, inet, text, varchar, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { desc } from "drizzle-orm/sql";

/**
 * PostgreSQL enums
 */
export const activityActionEnum = pgEnum("activity_action", [
    // Auth/session
    "signin",
    "signout",
    "session.create",
    "session.invalidate",
    // CRUD
    "create",
    "read",
    "update",
    "delete",
    // Permissions / roles
    "permission.grant",
    "permission.revoke",
    "permission.assign_role",
    "permission.remove_role",
    "permission.sync",
]);

export const activityStatusEnum = pgEnum("activity_status", [
    "success",
    "failure",
    "denied",
]);

/**
 * activity_log table
 * - Single wide immutable audit log
 * - Multi-tenant via actorOrgId and resourceOwnerOrgId
 * - JSONB for diffs and metadata, dedicated cols for permission auditing
 */
export const activityLog = pgTable(
    "activity_log",
    {
        id: uuid("id").primaryKey().defaultRandom(), // gen_random_uuid()
        occurredAt: timestamp("occurred_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        // Actor context
        actorUserId: uuid("actor_user_id"),
        actorOrgId: uuid("actor_org_id"),
        sessionId: uuid("session_id"),
        ipAddress: inet("ip_address"),
        userAgent: text("user_agent"),

        // Event semantics
        action: activityActionEnum("action").notNull(),
        feature: varchar("feature", { length: 64 }).notNull(),
        resourceType: varchar("resource_type", { length: 64 }),
        resourceId: text("resource_id"),
        resourceOwnerOrgId: uuid("resource_owner_org_id"),

        status: activityStatusEnum("status").notNull(),
        reasonCode: varchar("reason_code", { length: 64 }),
        message: text("message"),
        requestId: text("request_id"),

        // Structured details
        diff: jsonb("diff"), // For CRUD changes: created/new/changed_fields/removed
        metadata: jsonb("metadata"), // Route, method, geo, device, etc.

        // Permission-specific
        oldPermissions: jsonb("old_permissions"),
        newPermissions: jsonb("new_permissions"),
        targetUserId: uuid("target_user_id"),
        targetRoleId: uuid("target_role_id"),
        targetPermissionKey: varchar("target_permission_key", { length: 128 }),

        // Optional soft delete marker for administrative hide (logs remain immutable)
        softDeleted: boolean("soft_deleted").notNull().default(false),
    },
    (table) => {
        // Extract desc() expressions first to avoid TS generic incompatibilities in some Drizzle versions
        const occurredAtDesc = desc(table.occurredAt);

        return {
            // Common query paths
            idxOrgTime: index("idx_activity_org_time").on(table.actorOrgId, occurredAtDesc),
            idxUserTime: index("idx_activity_user_time").on(table.actorUserId, occurredAtDesc),
            idxFeatureActionTime: index("idx_activity_feature_action_time").on(table.feature, table.action, occurredAtDesc),
            idxResource: index("idx_activity_resource").on(table.resourceType, table.resourceId),
            idxStatusTime: index("idx_activity_status_time").on(table.status, occurredAtDesc),
            // Partial index for permission events would be created via SQL migration; Drizzle schema tracks base indexes.
            // For example (raw SQL in migrations):
            // CREATE INDEX idx_activity_permissions ON activity_log(target_user_id, occurred_at DESC) WHERE action LIKE 'permission.%';
        };
    }
);

// Re-export helpful TypeScript types
export type ActivityAction = (typeof activityActionEnum.enumValues)[number];
export type ActivityStatus = (typeof activityStatusEnum.enumValues)[number];

export type ActivityLogRow = typeof activityLog.$inferSelect;
export type NewActivityLogRow = typeof activityLog.$inferInsert;