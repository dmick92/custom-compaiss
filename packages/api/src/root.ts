import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { processRouter } from "./router/process";
import { projectRouter } from "./router/project";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  process: processRouter,
  project: projectRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
