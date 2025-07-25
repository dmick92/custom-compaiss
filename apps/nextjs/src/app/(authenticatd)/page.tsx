import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { AuthShowcase } from "../_components/auth-showcase";
import {
  CreatePostForm,
  PostCardSkeleton,
  PostList,
} from "../_components/posts";
import { CheckCircle, Circle } from "lucide-react";

export default function HomePage() {
  prefetch(trpc.post.all.queryOptions());

  // Updated todoList with nested structure
  const todoList = [
    {
      text: 'Set up authentication (sign up, sign in, sign out, session management).',
      done: true,
    },
    {
      text: 'Implement dashboard UI with user-specific data and navigation.',
      done: false,
    },
    {
      text: 'Create process designer feature (UI, logic, saving/loading processes).',
      done: true,
    },
    {
      text: 'Implement role-based access control and permissions.',
      done: false,
      children: [
        { text: 'Define roles and permissions', done: true },
        { text: 'Integrate permissions in UI', done: false },
        { text: 'Restrict access to protected routes', done: false },
      ],
    },
    {
      text: 'Add error handling, loading states, and user feedback (toasts, skeletons).',
      done: false,
      children: [
        { text: 'Show skeletons on loading', done: false },
        { text: 'Show toasts for errors', done: false },
      ],
    },
    { text: 'Write tests for critical features (unit, integration, e2e).', done: false },
    {
      text: 'Process pages',
      done: false,
      children: [
        { text: 'Create process listing page', done: true },
        { text: 'Create process editor/designer page', done: true },
      ],
    },
    {
      text: 'Strategy pages',
      done: false,
      children: [
        { text: 'Create strategy listing page', done: false },
        { text: 'Create strategy editor/designer page', done: false },
      ],
    },
    {
      text: 'Goal/OKR pages',
      done: false,
      children: [
        { text: 'Create goal/okr listing page', done: true },
      ],
    },
    {
      text: 'Project pages',
      done: false,
      children: [
        { text: 'Create Project listing page', done: true },
        { text: 'Create Project editor', done: false },
        { text: 'Add ability to start/create a project from a process', done: true },
      ],
    },
    {
      text: 'Properly handle unauthorized access', done: false,
      children: [
        { text: 'Create a middleware to handle unauthorized access', done: true },
        { text: 'Create a custom hook to handle unauthorized access', done: false },
        { text: 'Create a custom component to handle unauthorized access', done: false },
        { text: 'Add page check for unauthorized access', done: false },

      ],
    },

    {
      text: 'User management',
      done: false,
      children: [
        { text: 'Create user profile overview section', done: false },
        { text: 'Create user profile edit form', done: false },
        { text: 'Create user avatar upload section', done: false },
        { text: 'Create user account settings section', done: false },
        { text: 'Create user security settings section', done: false },
        { text: 'Create user notification preferences section', done: false },
        { text: 'Create user activity log section', done: false },

      ],
    },

    {
      text: 'Org management',
      done: false,
      children: [
        { text: 'List organizations user belongs to', done: false },
        { text: 'Create new organization', done: false },
        { text: 'Edit organization details', done: false },
        { text: 'Delete organization', done: false },
        { text: 'Invite user to organization', done: false },
        { text: 'Remove user from organization', done: false },
        { text: 'Assign roles to organization members', done: false },
        { text: 'View organization member list', done: false },
        { text: 'Transfer organization ownership', done: false },
        { text: 'Organization activity log', done: false },
      ],
    },

    {
      text: 'Team management',
      done: false,
      children: [
        { text: 'Design team data model', done: false },
        { text: 'Implement team creation flow', done: false },
        { text: 'List teams user is part of', done: false },
        { text: 'Add team member invitation', done: false },
        { text: 'Remove team member', done: false },
        { text: 'Assign roles to team members', done: false },
        { text: 'Edit team details', done: false },
        { text: 'Delete team', done: false },
        { text: 'Team activity log', done: false },
      ],
    },

    { text: 'Develop custom React hooks for SpiceDB integration', done: false },
  ];

  // Recursive list renderer
  function TodoList({ items, isChild }: { items: typeof todoList, isChild?: boolean }) {
    return (
      <ol
        className={[
          'list-none',
          isChild
            ? 'border-l-2 border-gray-200 pl-4 bg-muted/50 text-sm mt-2 mb-2 rounded-md shadow-sm'
            : 'columns-1 md:columns-2 gap-x-8 p-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-900/60 shadow-sm',
        ].join(' ')}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className={[
              'flex items-start gap-2 py-2 pr-2 transition-colors',
              !isChild && 'mb-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40',
              item.done ? 'text-gray-400 line-through' : '',
              item.children ? 'break-inside-avoid' : '',
            ].join(' ')}
          >
            <span className="mt-0.5">
              {item.done ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </span>
            <span className="flex-1">
              {item.text}
              {item.children && (
                <TodoList items={item.children as typeof todoList} isChild />
              )}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">App Build TODO List</h2>
        <TodoList items={todoList} />
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
