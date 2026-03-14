# AI Usage Log — TaskFlow

This document records how AI assistance was used during development of the TaskFlow application, including what was prompted, what was returned, and what was refined.

---

## Entry 1 — Project Scaffolding

**Date:** 2026-03-13
**Task:** Set up Next.js 14 project with App Router and TypeScript

**What was asked:**
"Create a Next.js 14 project scaffold with App Router, TypeScript strict mode, Tailwind CSS, and the following folder structure: app/(auth), app/(dashboard), components/, lib/, types/, prisma/. Include tsconfig.json, tailwind.config.ts, postcss.config.js, and next.config.js."

**What was returned:**
A complete project scaffold with the standard Next.js tsconfig (strict: true, moduleResolution: "bundler"), Tailwind configured with content paths covering `app/**` and `components/**`, and a minimal next.config.js. The route group folders `(auth)` and `(dashboard)` were created to separate unauthenticated and authenticated page trees without affecting URL paths.

**What was changed/refined:**
- Added a custom `brand` color palette to tailwind.config.ts (sky-blue scale) to give the app a consistent identity beyond the Tailwind defaults.
- Added `fontFamily.sans` override to use Inter as the primary typeface.
- Added a `scrollbar-hide` utility to globals.css for the sidebar scrolling behavior.

---

## Entry 2 — Prisma Schema Design

**Date:** 2026-03-13
**Task:** Design the database schema for users, projects, and tasks

**What was asked:**
"Design a Prisma schema for a task management app. Users have many projects. Projects have many tasks. Tasks need a status (TODO/IN_PROGRESS/IN_REVIEW/DONE) and priority (LOW/MEDIUM/HIGH/URGENT). Include cascade deletes."

**What was returned:**
A three-model schema (User, Project, Task) with enum types for TaskStatus and Priority. Used `@default(cuid())` for IDs (URL-safe, sortable, no sequential ID leakage), `onDelete: Cascade` on the Project→User and Task→Project foreign keys, and `@updatedAt` on all models.

**What was changed/refined:**
- Added `_count` virtual relation usage in API routes (not schema-level) to return task counts without fetching all task rows.
- Confirmed that `dueDate` should be `DateTime?` (nullable) since due dates are optional on tasks.
- The `IN_REVIEW` status was added beyond the typical TODO/IN_PROGRESS/DONE to support more realistic software team workflows.

---

## Entry 3 — NextAuth.js Configuration

**Date:** 2026-03-13
**Task:** Set up authentication with JWT sessions and Credentials provider

**What was asked:**
"Configure NextAuth.js v4 with the Credentials provider for email/password authentication. Use JWT strategy, bcrypt for password hashing, and extend the Session type to include the user's database ID."

**What was returned:**
An `authOptions` object with CredentialsProvider, JWT session strategy, custom `jwt` and `session` callbacks that thread the user ID from the database through to the session object. The `authorize` function uses Zod to validate credentials before hitting the database.

**What was changed/refined:**
- Added `next-auth.d.ts` at the root to augment the `Session` interface with `user.id: string`, resolving TypeScript errors in API routes that access `session.user.id`.
- Set `pages.signIn: '/login'` so NextAuth redirects to the custom login page instead of the default `/api/auth/signin`.
- The middleware.ts pattern `/(dashboard)/:path*` was carefully matched to the route group folder name, not the URL path — the URL is `/dashboard` while the folder is `(dashboard)`.

---

## Entry 4 — Drag-and-Drop Kanban with @dnd-kit

**Date:** 2026-03-13
**Task:** Implement a drag-and-drop kanban board for task status management

**What was asked:**
"Build a kanban board component using @dnd-kit/core and @dnd-kit/sortable. Tasks should be draggable between four columns (TODO, IN_PROGRESS, IN_REVIEW, DONE). Dropping a task onto a column should call an async callback to update the status via the API."

**What was returned:**
A `TaskBoard` component with `DndContext` wrapping four `DroppableColumn` components. Each column uses `useDroppable` with the status enum value as its ID, so `handleDragEnd` can identify the target column directly from `over.id`. `TaskCard` components use `useSortable` for the draggable behavior with a drag handle.

**What was changed/refined:**
- The `PointerSensor` was configured with `activationConstraint: { distance: 8 }` to prevent accidental drags when clicking the edit/delete buttons on task cards.
- Added `DragOverlay` to render a floating copy of the dragged card (with a slight rotation and scale) for better visual feedback.
- The `DroppableColumn` component was kept as an internal function (not exported) to keep the public API of the module clean.
- Added `STATUS_LABELS` lookup for column headers to avoid hardcoding display strings.

---

## Entry 5 — Dashboard Stats API

**Date:** 2026-03-13
**Task:** Create an aggregated stats endpoint for the dashboard page

**What was asked:**
"Write a Next.js API route that returns: total project count, total task count, task counts broken down by status, and the count of overdue tasks (dueDate in the past, status not DONE). Optimize to use as few database queries as possible."

**What was returned:**
A single GET handler that runs two queries in parallel using `Promise.all`: one `prisma.project.count` and one `prisma.task.findMany` that selects only `{ status, dueDate }` fields. The overdue calculation is done in-memory by iterating over the lean task records.

**What was changed/refined:**
- Initial suggestion was three queries (count projects, groupBy status, count overdue). Refined to two queries by computing the breakdown in JavaScript, reducing database round-trips.
- Confirmed that `task.dueDate < now && task.status !== 'DONE'` correctly excludes completed tasks from the overdue count.
- The `tasksByStatus` object is initialized with all four statuses set to 0 before the loop so the response always includes every status key, even if count is zero (avoids undefined in the frontend).

---

## Entry 6 — UI Component System with Tailwind

**Date:** 2026-03-13
**Task:** Build a consistent set of reusable UI primitives

**What was asked:**
"Create reusable React components: Button (with loading state, variants: primary/secondary/danger/ghost, sizes: sm/md/lg), Input (with label, error), Card (with hoverable prop), Badge, Modal (Escape key + backdrop click to close), Select, Textarea. Use a cn() utility for conditional class merging."

**What was returned:**
A complete set of typed components using `forwardRef` where appropriate (Input), HTML attribute inheritance via interface extension, and Tailwind class composition. The `cn()` function uses `clsx` to conditionally join class strings.

**What was changed/refined:**
- The Button's loading spinner was implemented as an inline SVG rather than a dependency on a spinner library, keeping bundle size minimal.
- Modal uses a `useEffect` to register the Escape key handler only when `open` is true, properly cleaning up the listener on unmount or close.
- The `Select` component accepts an `options` array prop to avoid repetitive `<option>` JSX at call sites.
- `Badge` is intentionally unstyled (no default color) since callers always pass a color class from the `STATUS_COLORS` or `PRIORITY_COLORS` constants.

---

## Entry 7 — API Response Utility Pattern

**Date:** 2026-03-13
**Task:** Standardize API responses across all routes

**What was asked:**
"Create helper functions for consistent API responses. All endpoints should return { success: true, data: T } or { success: false, error: string } with appropriate HTTP status codes."

**What was returned:**
Two functions in `lib/api-response.ts`: `successResponse<T>(data, status)` and `errorResponse(message, status)`, both returning `NextResponse.json` with the typed payload. The `ApiResponse<T>` type is defined in `types/index.ts` and shared between the helpers and the frontend fetch calls.

**What was changed/refined:**
- The generic `successResponse<T>` was typed to `NextResponse<ApiResponse<T>>` so TypeScript can infer the response body shape at call sites.
- The default status for `errorResponse` was set to 400 (Bad Request) since most validation errors map to that code; callers pass 401, 404, or 409 explicitly where needed.
- Frontend pages pattern-match on `data.success` before accessing `data.data`, providing a consistent error handling path with `toast.error()`.
