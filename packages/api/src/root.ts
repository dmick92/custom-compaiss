import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { processRouter } from "./router/process";
import { projectRouter } from "./router/project";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";
import { organizationRouter } from "./router/organization";
import { permissionRouter } from "./router/permission";
import { taskRouter } from "./router/task";
import { objectiveRouter } from "./router/objective";
import { strategyRouter } from "./router/strategy";
import { teamRouter } from "./router/team";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  process: processRouter,
  project: projectRouter,
  user: userRouter,
  organization: organizationRouter,
  permission: permissionRouter,
  task: taskRouter,
  objective: objectiveRouter,
  strategy: strategyRouter,
  team: teamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
