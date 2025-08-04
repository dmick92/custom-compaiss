import type { PgDatabase } from "drizzle-orm/pg-core";
// Import directly via relative path to the db package source
// Note: Cross-package Drizzle branded types can mismatch; ensure a single drizzle-orm instance across packages.
// Prefer importing from the db package entry when available.
import { activityLog, activityActionEnum, activityStatusEnum, NewActivityLogRow } from "../../db/src/activity";

// Re-export enums/types from DB schema for consumers (using relative path)
export { activityActionEnum, activityStatusEnum, activityLog } from "../../db/src/activity";
export type { ActivityAction, ActivityStatus, ActivityLogRow, NewActivityLogRow } from "../../db/src/activity";

/**
 * Thin, synchronous logger that inserts directly into activity_log.
 * - Never throws (swallows errors); optionally pass onError to observe failures.
 */

export type LogBaseContext = {
    actorUserId?: string | null;
    actorOrgId?: string | null;
    sessionId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    requestId?: string | null;

    feature: string;
    resourceType?: string | null;
    resourceId?: string | null;
    resourceOwnerOrgId?: string | null;

    status: "success" | "failure" | "denied";
    reasonCode?: string | null;
    message?: string | null;

    metadata?: Record<string, unknown> | null;
};

export type CrudDiff =
    | { new?: Record<string, unknown> }
    | { old?: Record<string, unknown> }
    | { changed_fields?: Record<string, { from: unknown; to: unknown }> };

export type PermissionDelta = {
    granted?: Array<{ key: string; scope?: string | null }>;
    revoked?: Array<{ key: string; scope?: string | null }>;
};

export type LogCrudContext = LogBaseContext & {
    action: "create" | "read" | "update" | "delete";
    diff?: CrudDiff | null;
};

export type LogSignContext = LogBaseContext & {
    action: "signin" | "signout" | "session.create" | "session.invalidate";
};

export type LogPermissionContext = LogBaseContext & {
    action:
    | "permission.grant"
    | "permission.revoke"
    | "permission.assign_role"
    | "permission.remove_role"
    | "permission.sync";
    oldPermissions?: Record<string, unknown> | null;
    newPermissions?: Record<string, unknown> | null;
    delta?: PermissionDelta | null;
    targetUserId?: string | null;
    targetRoleId?: string | null;
    targetPermissionKey?: string | null;
};

export type AnyLogContext = LogCrudContext | LogSignContext | LogPermissionContext;

export type LoggerOptions = {
    onError?: (err: unknown) => void;
};

type DB = PgDatabase<any>; // Keep PgDatabase but avoid strict branded-type checks at callsite with casts

export async function log(db: DB, ctx: AnyLogContext, opts?: LoggerOptions): Promise<void> {
    try {
        const insert: NewActivityLogRow = {
            // timestamps/uuid defaults handled by DB
            actorUserId: nullable(ctx.actorUserId),
            actorOrgId: nullable(ctx.actorOrgId),
            sessionId: nullable(ctx.sessionId),
            ipAddress: nullable(ctx.ipAddress),
            userAgent: nullable(ctx.userAgent),

            action: ctx.action as any,
            feature: ctx.feature,
            resourceType: nullable(ctx.resourceType),
            resourceId: nullable(ctx.resourceId),
            resourceOwnerOrgId: nullable(ctx.resourceOwnerOrgId),

            status: ctx.status as any,
            reasonCode: nullable(ctx.reasonCode),
            message: nullable(ctx.message),
            requestId: nullable(ctx.requestId),

            metadata: nullableJson(ctx.metadata),
            // Optional fields depending on action
            diff: "diff" in ctx ? nullableJson(ctx.diff) : undefined,

            oldPermissions: "oldPermissions" in ctx ? nullableJson(ctx.oldPermissions) : undefined,
            newPermissions: "newPermissions" in ctx ? nullableJson(ctx.newPermissions) : undefined,

            targetUserId: "targetUserId" in ctx ? nullable(ctx.targetUserId) : undefined,
            targetRoleId: "targetRoleId" in ctx ? nullable(ctx.targetRoleId) : undefined,
            targetPermissionKey: "targetPermissionKey" in ctx ? nullable(ctx.targetPermissionKey) : undefined,
        };

        // If caller supplied a delta for permissions, merge it into metadata under "permissionDelta"
        if ("delta" in ctx && ctx.delta) {
            const mergedMeta = {
                ...(ctx.metadata ?? {}),
                permissionDelta: ctx.delta,
            };
            insert.metadata = mergedMeta as any;
        }

        // Casts avoid cross-package drizzle branded-type incompatibilities at the boundary.
        await (db as any).insert(activityLog as any).values(insert as any);
    } catch (err) {
        if (opts?.onError) opts.onError(err);
        // Swallow to avoid impacting business flow
    }
}

/**
 * Convenience helpers
 */

export async function logSignIn(db: DB, ctx: Omit<LogSignContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "signin",
            resourceType: ctx.resourceType ?? "user",
            resourceId: ctx.resourceId ?? ctx.actorUserId ?? null,
        },
        opts,
    );
}

export async function logSignOut(db: DB, ctx: Omit<LogSignContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "signout",
            resourceType: ctx.resourceType ?? "user",
            resourceId: ctx.resourceId ?? ctx.actorUserId ?? null,
        },
        opts,
    );
}

export async function logSessionCreate(db: DB, ctx: Omit<LogSignContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "session.create",
        },
        opts,
    );
}

export async function logSessionInvalidate(db: DB, ctx: Omit<LogSignContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "session.invalidate",
        },
        opts,
    );
}

export async function logCrud(db: DB, ctx: LogCrudContext, opts?: LoggerOptions) {
    return log(db, ctx, opts);
}

export async function logPermissionGrant(db: DB, ctx: Omit<LogPermissionContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "permission.grant",
        },
        opts,
    );
}

export async function logPermissionRevoke(db: DB, ctx: Omit<LogPermissionContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "permission.revoke",
        },
        opts,
    );
}

export async function logAssignRole(db: DB, ctx: Omit<LogPermissionContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "permission.assign_role",
        },
        opts,
    );
}

export async function logRemoveRole(db: DB, ctx: Omit<LogPermissionContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "permission.remove_role",
        },
        opts,
    );
}

export async function logPermissionSync(db: DB, ctx: Omit<LogPermissionContext, "action">, opts?: LoggerOptions) {
    return log(
        db,
        {
            ...ctx,
            action: "permission.sync",
        },
        opts,
    );
}

/**
 * Helpers
 */
function nullable<T>(v: T | undefined | null): T | null {
    return v == null ? null : (v as T);
}
function nullableJson(v: unknown | undefined | null): any | null {
    return v == null ? null : (v as any);
}