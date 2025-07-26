import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { member, organization } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { permissions, spicedbClient } from "@acme/authz";

export const organizationRouter = {
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.organization.findFirst({
        where: eq(organization.id, input.id),
      });
    }),
} satisfies TRPCRouterRecord;
