import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { processRouter } from "./router/process";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  process: processRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
