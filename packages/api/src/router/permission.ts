import { type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";
import { permissions, spicedbClient } from "@acme/authz";

// Define valid resource types and permissions
const resourceTypes = [
  "organization",
  "team",
  "objective",
  "key_result", // Fixed: use underscore to match permissions object
  "strategy",
  "process",
  "project",
  "task"
] as const;

const permissionTypes = [
  "create",
  "read",
  "update",
  "delete"
] as const;

// Map frontend permission names to backend permission names
const permissionMapping: Record<string, string> = {
  "view": "read",
  "edit": "update",
  "adminAccess": "update",
  "manage": "update"
};

export const permissionRouter = {
  check: protectedProcedure
    .input(z.object({
      userId: z.string(),
      resource: z.string(),
      permission: z.string(),
    }))
    .query(async ({ input }) => {
      const { userId, resource, permission } = input;

      // Parse resource to extract type and id
      const [resourceType, resourceId] = resource.split(":");
      if (!resourceId) {
        return { allowed: false };
      }

      // Validate resource type
      if (!resourceTypes.includes(resourceType as any)) {
        return { allowed: false };
      }

      // Map frontend permission to backend permission
      const backendPermission = permissionMapping[permission] || permission;

      // Validate permission type
      if (!permissionTypes.includes(backendPermission as any)) {
        return { allowed: false };
      }

      // Dynamic permission check with proper typing
      const resourcePermissions = permissions[resourceType as keyof typeof permissions];
      const checkMethods = resourcePermissions?.check as Record<string, (subject: string, resource: string) => any>;

      if (!checkMethods?.[backendPermission]) {
        return { allowed: false };
      }

      const permissionCheck = checkMethods[backendPermission];
      const checkOperation = permissionCheck(`user:${userId}`, resource);

      // Execute the permission check against SpiceDB
      const allowed = await checkOperation.execute(spicedbClient);

      return { allowed };
    }),
  batchCheck: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        resources: z.array(z.string()), // ["task:abc", "project:def"]
        permissions: z.array(z.string()), // ["view", "edit"]
      }),
    )
    .query(async ({ input }) => {
      const { userId, resources, permissions: permsToCheck } = input;
      console.log(userId, resources, permsToCheck);

      const result: Record<string, Record<string, boolean>> = {};

      for (const resource of resources) {
        const [resourceType, resourceId] = resource.split(":");
        if (!resourceId || !resourceTypes.includes(resourceType as any)) continue;

        const resourcePermissions = permissions[resourceType as keyof typeof permissions];
        const checkMethods = resourcePermissions?.check as Record<string, (subject: string, resource: string) => any>;

        for (const permission of permsToCheck) {
          // Map frontend permission to backend permission
          const backendPermission = permissionMapping[permission] || permission;

          if (!permissionTypes.includes(backendPermission as any)) continue;

          const checkFn = checkMethods?.[backendPermission];
          if (!checkFn) continue;

          const checkOperation = checkFn(`user:${userId}`, resource);
          const allowed = await checkOperation.execute(spicedbClient);

          if (!result[resource]) result[resource] = {};
          result[resource][permission] = allowed;
        }
      }
      console.log(result);
      return result; // e.g. { "task:abc": { view: true, edit: false }, ... }
    }),
} satisfies TRPCRouterRecord;
