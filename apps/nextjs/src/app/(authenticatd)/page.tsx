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

  // const todoList = [
  //   {
  //     text: 'Set up authentication (sign up, sign in, sign out, session management).',
  //     done: true,
  //   },
  //   {
  //     text: 'Implement dashboard UI with user-specific data and navigation.',
  //     done: false,
  //   },
  //   {
  //     text: 'Create process designer feature (UI, logic, saving/loading processes).',
  //     done: true,
  //   },
  //   {
  //     text: 'Implement role-based access control and permissions.',
  //     done: false,
  //     children: [
  //       { text: 'Define roles and permissions', done: true },
  //       { text: 'Integrate permissions in UI', done: false },
  //       { text: 'Restrict access to protected routes', done: false },
  //     ],
  //   },
  //   {
  //     text: 'Add error handling, loading states, and user feedback (toasts, skeletons).',
  //     done: false,
  //     children: [
  //       { text: 'Show skeletons on loading', done: false },
  //       { text: 'Show toasts for errors', done: false },
  //     ],
  //   },
  //   { text: 'Write tests for critical features (unit, integration, e2e).', done: false },
  //   {
  //     text: 'Process pages',
  //     done: true,
  //     children: [
  //       { text: 'Create process listing page', done: true },
  //       { text: 'Create process editor/designer page', done: true },
  //     ],
  //   },
  //   {
  //     text: 'Strategy pages',
  //     done: false,
  //     children: [
  //       { text: 'Create strategy listing page', done: true },
  //       { text: 'Create strategy editor/designer page', done: false },
  //     ],
  //   },
  //   {
  //     text: 'Goal/OKR pages',
  //     done: true,
  //     children: [
  //       { text: 'Create goal/okr listing page', done: true },
  //       { text: 'Create goal/okr editor page', done: false },
  //     ],
  //   },
  //   {
  //     text: 'Project pages',
  //     done: false,
  //     children: [
  //       { text: 'Create Project listing page', done: true },
  //       { text: 'Create Project editor', done: false },
  //       { text: 'Add ability to start/create a project from a process', done: true },
  //     ],
  //   },
  //   {
  //     text: 'Properly handle unauthorized access', done: false,
  //     children: [
  //       { text: 'Create a middleware to handle unauthorized access', done: true },
  //       { text: 'Create a custom hook to handle unauthorized access', done: false },
  //       { text: 'Create a custom component to handle unauthorized access', done: false },
  //       { text: 'Add page check for unauthorized access', done: false },

  //     ],
  //   },

  //   {
  //     text: 'User management',
  //     done: false,
  //     children: [
  //       { text: 'Create user profile overview section', done: true },
  //       { text: 'Create user profile edit form', done: true },
  //       { text: 'Create user avatar upload section', done: false },
  //       { text: 'Create user account settings section', done: true },
  //       { text: 'Create user security settings section', done: true },
  //       { text: 'Create user notification preferences section', done: false },
  //       { text: 'Create user activity log section', done: false },

  //     ],
  //   },

  //   {
  //     text: 'Org management',
  //     done: false,
  //     children: [
  //       { text: 'List organizations user belongs to', done: false },
  //       { text: 'Create new organization', done: true },
  //       { text: 'Edit organization details', done: true },
  //       { text: 'Delete organization', done: false },
  //       { text: 'Invite user to organization', done: false },
  //       { text: 'Remove user from organization', done: false },
  //       { text: 'Assign roles to organization members', done: false },
  //       { text: 'View organization member list', done: false },
  //       { text: 'Transfer organization ownership', done: false },
  //       { text: 'Organization activity log', done: false },
  //     ],
  //   },

  //   {
  //     text: 'Team management',
  //     done: false,
  //     children: [
  //       { text: 'Design team data model', done: false },
  //       { text: 'Implement team creation flow', done: false },
  //       { text: 'List teams user is part of', done: false },
  //       { text: 'Add team member invitation', done: false },
  //       { text: 'Remove team member', done: false },
  //       { text: 'Assign roles to team members', done: false },
  //       { text: 'Edit team details', done: false },
  //       { text: 'Delete team', done: false },
  //       { text: 'Team activity log', done: false },
  //     ],
  //   },

  //   { text: 'Develop custom React hooks for SpiceDB integration', done: true },

  //   {
  //     text: 'Add spicedb permissions', done: false,
  //     children: [
  //       {
  //         text: 'Strategy', done: false,
  //         children: [
  //           { text: 'create', done: false },
  //           { text: 'read', done: false },
  //           { text: 'update', done: false },
  //           { text: 'delete', done: false },
  //           { text: 'assign users', done: false },
  //         ],
  //       },
  //       {
  //         text: 'Goal/OKR', done: false,
  //         children: [
  //           { text: 'create', done: false },
  //           { text: 'read', done: false },
  //           { text: 'update', done: false },
  //           { text: 'delete', done: false },
  //           { text: 'assign users', done: false },
  //         ],
  //       },
  //       {
  //         text: 'Project', done: false,
  //         children: [
  //           { text: 'create', done: false },
  //           { text: 'read', done: false },
  //           { text: 'update', done: false },
  //           { text: 'delete', done: false },
  //           { text: 'assign users', done: false },
  //         ],
  //       },
  //       {
  //         text: 'Team', done: false,
  //         children: [
  //           { text: 'create', done: false },
  //           { text: 'read', done: false },
  //           { text: 'update', done: false },
  //           { text: 'delete', done: false },
  //           { text: 'assign users', done: false },
  //         ],
  //       },
  //       {
  //         text: 'User', done: false,
  //         children: [
  //           { text: 'create', done: false },
  //           { text: 'read', done: false },
  //           { text: 'update', done: false },
  //           { text: 'delete', done: false },
  //           { text: 'assign users', done: false },
  //         ],
  //       },
  //       {
  //         text: 'Organization', done: false,
  //         children: [
  //           { text: 'create', done: false },
  //           { text: 'read', done: false },
  //           { text: 'update', done: false },
  //           { text: 'delete', done: false },
  //           { text: 'assign users', done: false },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  const todoList = [
    {
      text: 'Authentication & User Management',
      done: false,
      children: [
        { text: 'User registration with email verification', done: false },
        { text: 'User login/logout with session management', done: true },
        { text: 'Password reset functionality', done: false },
        { text: 'User profile CRUD operations', done: false },
        { text: 'User avatar upload and management', done: false },
        { text: 'User account settings (email, password, preferences)', done: false },
        { text: 'User security settings (2FA, session management)', done: false },
        { text: 'User activity log tracking', done: false },
      ],
    },
    {
      text: 'Organization Management',
      done: false,
      children: [
        { text: 'Organization CRUD operations', done: false },
        { text: 'Organization member invitation system', done: false },
        { text: 'Organization member management (add, remove, roles)', done: false },
        { text: 'Organization role assignment (owner, admin, member)', done: false },
        { text: 'Organization settings and configuration', done: false },
        { text: 'Organization activity log tracking', done: false },
        { text: 'Organization ownership transfer', done: false },
      ],
    },
    {
      text: 'Team Management',
      done: false,
      children: [
        { text: 'Team CRUD operations', done: false },
        { text: 'Team member invitation and management', done: false },
        { text: 'Team role assignment (lead, member)', done: false },
        { text: 'Team settings and configuration', done: false },
        { text: 'Team activity log tracking', done: false },
        { text: 'Team assignment to projects/processes', done: false },
      ],
    },
    {
      text: 'Strategy Management',
      done: false,
      children: [
        { text: 'Strategy CRUD operations', done: false },
        { text: 'Strategy sharing and collaboration', done: false },
        { text: 'Strategy assignment to users/teams', done: false },
        { text: 'Strategy versioning and history', done: false },
        { text: 'Strategy activity log tracking', done: false },
        { text: 'Strategy export/import functionality', done: false },
      ],
    },
    {
      text: 'Goal/OKR Management',
      done: false,
      children: [
        { text: 'Goal/OKR CRUD operations', done: false },
        { text: 'Goal/OKR assignment to users/teams', done: false },
        { text: 'Goal/OKR progress tracking', done: false },
        { text: 'Goal/OKR sharing and collaboration', done: false },
        { text: 'Goal/OKR activity log tracking', done: false },
        { text: 'Goal/OKR reporting and analytics', done: false },
      ],
    },
    {
      text: 'Project Management',
      done: false,
      children: [
        { text: 'Project CRUD operations', done: false },
        { text: 'Project assignment to users/teams', done: false },
        { text: 'Project execution tracking and status management', done: false },
        { text: 'Project sharing and collaboration', done: false },
        { text: 'Project activity log tracking', done: false },
        { text: 'Project creation from process templates', done: false },
        { text: 'Project reporting and analytics', done: false },
      ],
    },
    {
      text: 'Process Management',
      done: false,
      children: [
        { text: 'Process CRUD operations', done: false },
        { text: 'Process designer UI improvements', done: true },
        { text: 'Process execution tracking', done: false },
        { text: 'Process assignment to users/teams', done: false },
        { text: 'Process sharing and collaboration', done: false },
        { text: 'Process activity log tracking', done: false },
        { text: 'Process template management', done: false },
      ],
    },
    {
      text: 'ReBAC Schema Implementation',
      done: false,
      children: [
        { text: 'Design ReBAC schema for all entities', done: false },
        { text: 'Implement User entity permissions (CRUD, assign)', done: false },
        { text: 'Implement Organization entity permissions (CRUD, assign)', done: false },
        { text: 'Implement Team entity permissions (CRUD, assign)', done: false },
        { text: 'Implement Strategy entity permissions (CRUD, assign, share)', done: false },
        { text: 'Implement Goal/OKR entity permissions (CRUD, assign, share)', done: false },
        { text: 'Implement Project entity permissions (CRUD, assign, share, execute)', done: false },
        { text: 'Implement Process entity permissions (CRUD, assign, share, execute)', done: false },
        { text: 'Integrate ReBAC permissions in UI components', done: false },
        { text: 'Add permission checks to all API endpoints', done: false },
      ],
    },
    {
      text: 'Activity Logging System',
      done: false,
      children: [
        { text: 'Design activity log data model', done: false },
        { text: 'Implement user action logging (CRUD operations)', done: false },
        { text: 'Implement system event logging (login, logout, permission changes)', done: false },
        { text: 'Add activity log tracking to all entities', done: false },
        { text: 'Create activity log UI components', done: false },
        { text: 'Implement activity log filtering and search', done: false },
        { text: 'Add activity log export functionality', done: false },
      ],
    },
    {
      text: 'UI/UX Improvements',
      done: false,
      children: [
        { text: 'Implement loading states and skeletons', done: false },
        { text: 'Add error handling and user feedback (toasts)', done: false },
        { text: 'Implement responsive design for all pages', done: false },
        { text: 'Add confirmation dialogs for destructive actions', done: false },
        { text: 'Implement bulk operations for list views', done: false },
        { text: 'Add search and filtering to all list pages', done: false },
      ],
    },
    {
      text: 'Security & Authorization',
      done: false,
      children: [
        { text: 'Implement middleware for unauthorized access handling', done: true },
        { text: 'Create custom hooks for permission checking', done: false },
        { text: 'Add permission gates to all protected components', done: false },
        { text: 'Implement API rate limiting', done: false },
        { text: 'Add input validation and sanitization', done: false },
        { text: 'Implement audit logging for security events', done: false },
      ],
    },
    {
      text: 'Testing & Quality Assurance',
      done: false,
      children: [
        { text: 'Write unit tests for core business logic', done: false },
        { text: 'Write integration tests for API endpoints', done: false },
        { text: 'Write end-to-end tests for critical user flows', done: false },
        { text: 'Add test coverage for permission checks', done: false },
        { text: 'Implement automated testing pipeline', done: false },
      ],
    },
    {
      text: 'Performance & Optimization',
      done: false,
      children: [
        { text: 'Implement data caching strategies', done: false },
        { text: 'Add pagination to large data sets', done: false },
        { text: 'Optimize database queries and indexes', done: false },
        { text: 'Implement lazy loading for components', done: false },
        { text: 'Add performance monitoring and metrics', done: false },
      ],
    },
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

