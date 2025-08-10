import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "@acme/db";
import { team, teamMember, user } from "@acme/db/schema";
import { protectedProcedure } from "../trpc";
import { z } from "zod";

/**
 * Team router
 * Endpoints:
 * - create
 * - update
 * - delete
 * - addMember
 * - removeMember
 * - updateMemberRole
 * - listByActiveOrg (kept for client listing)
 *
 * Notes:
 * - Schema provided: team(id, name, organizationId, createdAt, updatedAt)
 * - teamMember table exists but has: id, teamId, userId, createdAt (no role column as per answer)
 *   Therefore, role will be omitted from mutations for now to match the schema.
 */
export const teamRouter = {
    // List teams for the active organization, including members
    listByActiveOrg: protectedProcedure.query(async ({ ctx }) => {
        const orgId =
            (ctx.session as any)?.activeOrganizationId ||
            (ctx.session as any)?.session?.activeOrganizationId;
        if (!orgId) return [] as Array<{
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date | null;
            members: Array<{ id: string; name: string; email: string; avatarUrl?: string | null; role: string }>
        }>;

        const rows = await ctx.db
            .select({
                teamId: team.id,
                teamName: team.name,
                teamOrgId: team.organizationId,
                teamCreatedAt: team.createdAt,
                teamUpdatedAt: team.updatedAt,
                memberUserId: teamMember.userId,
                memberRole: teamMember.role,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userImage: user.image,
            })
            .from(team)
            .leftJoin(teamMember, eq(teamMember.teamId, team.id))
            .leftJoin(user, eq(user.id, teamMember.userId))
            .where(eq(team.organizationId, orgId));

        const byTeam = new Map<string, {
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date | null;
            members: Array<{ id: string; name: string; email: string; avatarUrl?: string | null; role: string }>
        }>();

        for (const r of rows) {
            if (!byTeam.has(r.teamId)) {
                byTeam.set(r.teamId, {
                    id: r.teamId,
                    name: r.teamName,
                    organizationId: r.teamOrgId,
                    createdAt: r.teamCreatedAt,
                    updatedAt: r.teamUpdatedAt ?? null,
                    members: [],
                });
            }
            if (r.memberUserId && r.userId) {
                const normalizedRole = (() => {
                    const val = (r.memberRole ?? "member").toString();
                    const lower = val.toLowerCase();
                    if (lower === "owner") return "Owner";
                    if (lower === "admin") return "Admin";
                    if (lower === "member") return "Member";
                    return val;
                })();
                byTeam.get(r.teamId)!.members.push({
                    id: r.userId,
                    name: r.userName ?? "",
                    email: r.userEmail ?? "",
                    avatarUrl: r.userImage,
                    role: normalizedRole,
                });
            }
        }

        return Array.from(byTeam.values());
    }),

    // Create team in active org
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const orgId =
                (ctx.session as any)?.activeOrganizationId ||
                (ctx.session as any)?.session?.activeOrganizationId;
            if (!orgId) {
                throw new Error("No active organization");
            }

            const created = await ctx.db
                .insert(team)
                .values({
                    id: crypto.randomUUID(),
                    name: input.name,
                    organizationId: orgId,
                    createdAt: new Date(),
                })
                .returning({ id: team.id });

            return { id: created[0]!.id };
        }),

    // Update team name
    update: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.update(team).set({ name: input.name, updatedAt: new Date() }).where(eq(team.id, input.id));
            return { id: input.id };
        }),

    // Delete team (cascades delete members due to FK on teamMember)
    delete: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(team).where(eq(team.id, input.id));
            return { id: input.id };
        }),

    // Add member to team
    addMember: protectedProcedure
        .input(
            z.object({
                teamId: z.string().min(1),
                userId: z.string().min(1),
                role: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Prevent duplicates
            const exists = await ctx.db.query.teamMember.findFirst({
                where: and(eq(teamMember.teamId, input.teamId), eq(teamMember.userId, input.userId)),
            });
            if (!exists) {
                await ctx.db.insert(teamMember).values({
                    id: crypto.randomUUID(),
                    teamId: input.teamId,
                    userId: input.userId,
                    createdAt: new Date(),
                    role: input.role,
                });
            }
            return { teamId: input.teamId, userId: input.userId };
        }),

    // Remove member from team
    removeMember: protectedProcedure
        .input(
            z.object({
                teamId: z.string().min(1),
                userId: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(teamMember)
                .where(and(eq(teamMember.teamId, input.teamId), eq(teamMember.userId, input.userId)));
            return { teamId: input.teamId, userId: input.userId };
        }),

    // Update member role
    updateMemberRole: protectedProcedure
        .input(
            z.object({
                teamId: z.string().min(1),
                userId: z.string().min(1),
                role: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(teamMember)
                .set({ role: input.role, updatedAt: new Date() })
                .where(and(eq(teamMember.teamId, input.teamId), eq(teamMember.userId, input.userId)));
            return { teamId: input.teamId, userId: input.userId, role: input.role };
        }),
} satisfies TRPCRouterRecord;