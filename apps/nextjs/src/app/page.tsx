import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { AuthShowcase } from "./_components/auth-showcase";
import {
  CreatePostForm,
  PostCardSkeleton,
  PostList,
} from "./_components/posts";

export default function HomePage() {
  prefetch(trpc.post.all.queryOptions());

  const todoList = [
    { text: 'Set up authentication (sign up, sign in, sign out, session management).', done: true },
    { text: 'Implement dashboard UI with user-specific data and navigation.', done: false },
    { text: 'Create process designer feature (UI, logic, saving/loading processes).', done: true },
    { text: 'Implement role-based access control and permissions.', done: false },
    { text: 'Add error handling, loading states, and user feedback (toasts, skeletons).', done: false },
    { text: 'Write tests for critical features (unit, integration, e2e).', done: false },

    { text: 'create process listing page', done: true },
    { text: 'create process editor/designer page', done: true },

    { text: 'create strategy listing page', done: false },
    { text: 'create strategy editor/designer page', done: false },

    { text: 'create goal/okr listing page', done: false },

    { text: 'create Project listing page', done: true },
    { text: 'create Project editor', done: false },
    { text: 'add ability to start/create a project from a process', done: true },

  ]

  return (
    <div className="container mx-auto space-y-6 p-6">

      <section>
        <h2 className="text-xl font-semibold mb-2">App Build TODO List</h2>
        <ol className="list-decimal list-inside space-y-1">
          {todoList.map((item, idx) => (
            <li
              key={idx}
              className={item.done ? 'line-through text-gray-400' : ''}
            >
              {item.text}
            </li>
          ))}
        </ol>
      </section>
    </div>
    // <HydrateClient>
    //   <main className="container flex flex-1 flex-col py-16">
    //     <div className="flex flex-1 flex-col items-center justify-center gap-4">
    //       <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
    //         Create <span className="text-primary">T3</span> Turbo
    //       </h1>
    //       <AuthShowcase />

    //       <CreatePostForm />
    //       <div className="w-full max-w-2xl overflow-y-scroll">
    //         <Suspense
    //           fallback={
    //             <div className="flex w-full flex-col gap-4">
    //               <PostCardSkeleton />
    //               <PostCardSkeleton />
    //               <PostCardSkeleton />
    //             </div>
    //           }
    //         >
    //           <PostList />
    //         </Suspense>
    //       </div>
    //     </div>
    //   </main>
    // </HydrateClient>
  );
}
