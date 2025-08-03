import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, organization } from "better-auth/plugins";

import { db } from "@acme/db/client";
import { permissions, spicedbClient } from "@acme/authz";
import { UserPreferences, user } from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Initialize Better‑Auth with:
 * - Organization plugin
 * - After sign‑in bootstrap: set session.activeOrganizationId to last‑used org, else first membership.
 *   Also upsert user_preferences.lastOrganizationId.
 */
export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
      organization({
        teams: {
          enabled: true,
        },
        organizationCreation: {
          afterCreate: async ({ organization, member }) => {
            await permissions.organization.grant.owner(
              `user:${member.userId}`,
              `organization:${organization.id}`
            ).execute(spicedbClient);
          }
        },
      }),
    ],
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }, request) => {
        //todo build send email function and connect to email provider
        // await sendEmail({
        //     to: user.email,
        //     subject: 'Verify your email address',
        //     text: `Click the link to verify your email: ${url}`
        // })
      }

    },
    trustedOrigins: ["expo://"],

    /**
     * After sign‑in, ensure the session has an active organization:
     * 1) Read user_preferences.lastOrganizationId
     * 2) If valid membership, set active org to that
     * 3) Else, pick the first membership (if any), set it active, and persist as last‑used
     */
    events: {
      // depending on Better‑Auth version, this may be 'afterSignIn' or similar
      async afterSignIn(ctx: any) {
        try {
          const signedInUserId: string | undefined = ctx?.user?.id;
          if (!signedInUserId) return;

          // 1) Load last-used organization from preferences (if any)
          const pref = await db.query.UserPreferences.findFirst?.({
            where: eq(UserPreferences.userId, signedInUserId),
          }).catch(() => null as any);

          let candidateOrgId: string | null = pref?.lastOrganizationId ?? null;

          // 2) Fetch memberships via server SDK from the current auth instance
          const authInstance = ctx?.auth ?? authRef;
          if (!authInstance?.organization) return;

          const memberships: Array<{ organizationId?: string; organization?: { id?: string } }> =
            (await authInstance.organization.getMemberships?.({ userId: signedInUserId })) ?? [];

          const membershipOrgIds: Set<string> = new Set(
            memberships.map((m) => m.organizationId ?? m.organization?.id).filter(Boolean) as string[],
          );

          // If candidate from prefs is not in memberships, discard it
          if (candidateOrgId && !membershipOrgIds.has(candidateOrgId)) {
            candidateOrgId = null;
          }

          // If still no candidate, pick the first membership
          if (!candidateOrgId) {
            const first = memberships[0];
            candidateOrgId = (first?.organizationId ?? first?.organization?.id) ?? null;
          }

          if (!candidateOrgId) {
            // No organizations; do nothing (UI will guide to create-organization)
            return;
          }

          // 3) Set active org with server SDK
          await authInstance.organization.setActiveOrganization?.({
            userId: signedInUserId,
            organizationId: candidateOrgId,
          });

          // 4) Upsert preferences with lastOrganizationId
          if (pref) {
            await db
              .update(UserPreferences)
              .set({ lastOrganizationId: candidateOrgId })
              .where(eq(UserPreferences.userId, signedInUserId));
          } else {
            await db.insert(UserPreferences).values({
              userId: signedInUserId,
              lastOrganizationId: candidateOrgId,
            });
          }
        } catch (err) {
          console.error("[auth.afterSignIn] failed to set active organization", err);
        }
      },
    },
  } satisfies BetterAuthOptions & {
    events?: {
      afterSignIn?: (ctx: any) => Promise<void>;
    };
  };

  // Create instance and store a ref for event usage
  const authRef = betterAuth(config) as unknown as {
    api?: unknown;
    organization?: {
      setActiveOrganization?: (args: { userId: string; organizationId: string }) => Promise<void>;
      getMemberships?: (args: { userId: string }) => Promise<Array<{ organizationId?: string; organization?: { id?: string } }>>;
    };
  };

  return authRef as unknown as ReturnType<typeof betterAuth>;
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
