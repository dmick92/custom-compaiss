import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, organization } from "better-auth/plugins";

import { db } from "@acme/db/client";
import { permissions, spicedbClient } from "@acme/authz";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  // discordClientId: string;
  // discordClientSecret: string;
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
        }
      }),
    ],
    socialProviders: {
      // discord: {
      //   clientId: options.discordClientId,
      //   clientSecret: options.discordClientSecret,
      //   redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
      // },
    },
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: ["expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
