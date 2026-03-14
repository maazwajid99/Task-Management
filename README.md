# TaskFlow — Project & Task Management

A full-stack task management application built with Next.js 14, TypeScript, Prisma, and PostgreSQL. Organize projects, manage tasks on a kanban board, and track progress through an analytics dashboard.

---

## Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Framework | Next.js 14 (App Router) | Unified full-stack solution; server components reduce client-side JavaScript; file-based routing simplifies structure |
| Language | TypeScript (strict) | End-to-end type safety from database models to UI components eliminates entire classes of runtime errors |
| Styling | Tailwind CSS | Utility-first approach enables rapid iteration without context-switching to CSS files; purges unused styles in production |
| Database ORM | Prisma + PostgreSQL | Type-safe query builder auto-generated from schema; migration tooling; excellent DX with schema-first approach |
| Authentication | NextAuth.js (Credentials) | Battle-tested auth library; JWT sessions avoid database round-trips on every request; extensible to OAuth providers |
| Drag & Drop | @dnd-kit | Lightweight, accessible, framework-agnostic; better performance than react-beautiful-dnd; active maintenance |
| Charts | Recharts | React-native chart library; composable API; responsive container support out of the box |
| Validation | Zod | Runtime schema validation with TypeScript inference; used for both API input validation and form schemas |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Supabase, Neon, Railway)
- npm or yarn

### 1. Clone and Install

```bash
git clone <repo-url>
cd taskflow
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up the Database

```bash
npm run db:push
```

This syncs the Prisma schema to your PostgreSQL database without migrations (suitable for development). For production, use `prisma migrate deploy`.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`. Create an account via the register page, then explore the dashboard.

### Optional: Prisma Studio

```bash
npm run db:studio
```

Opens a visual database browser at [http://localhost:5555](http://localhost:5555).

---

## Folder Structure

```
d:/assessment/
├── app/
│   ├── (auth)/              # Login and register pages (unauthenticated)
│   ├── (dashboard)/         # Protected app pages (sidebar layout)
│   │   ├── page.tsx         # Dashboard with stats and charts
│   │   └── projects/        # Project list and detail with kanban board
│   ├── api/                 # REST API routes
│   │   ├── auth/            # NextAuth + registration endpoint
│   │   ├── projects/        # CRUD for projects
│   │   ├── tasks/           # CRUD for tasks with filters
│   │   └── dashboard/       # Aggregated stats endpoint
│   └── layout.tsx           # Root layout with SessionProvider
├── components/
│   ├── ui/                  # Reusable primitives (Button, Card, Modal, etc.)
│   ├── layout/              # Sidebar, Header, Providers
│   ├── projects/            # ProjectCard, ProjectForm
│   ├── tasks/               # TaskCard, TaskForm, TaskBoard (kanban), TaskFilters
│   └── dashboard/           # StatsCard, TaskChart
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client singleton
│   ├── validations.ts       # Zod schemas for all inputs
│   ├── api-response.ts      # Consistent { success, data, error } response helpers
│   └── utils.ts             # cn(), formatDate(), status/priority constants
├── types/index.ts           # Shared TypeScript types (re-exports from Prisma)
├── prisma/schema.prisma     # Database schema
└── middleware.ts            # Route protection via NextAuth middleware
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new user account |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project with tasks |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (cascades tasks) |
| GET | `/api/tasks` | List tasks (filterable by project, status, priority) |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update task (used for status changes during drag) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/dashboard` | Aggregated stats for the dashboard |

All responses follow the format: `{ success: boolean, data?: T, error?: string }`

---

## Trade-offs

**JWT vs database sessions**: JWT sessions avoid database lookups on every authenticated request, improving performance. The trade-off is that revoking tokens requires additional infrastructure (e.g. a token blacklist). For this use case, short-lived JWTs are acceptable.

**Client-side filtering vs server-side**: The project detail page fetches all tasks and filters them client-side. This simplifies state management and avoids extra network requests during filter changes. For projects with thousands of tasks, server-side pagination would be preferable.

**`db:push` vs migrations**: `prisma db push` is used for simplicity in development. In production, `prisma migrate` with versioned migration files would be required for safe schema evolution and rollback capability.

**Optimistic updates**: The current implementation updates state only after a successful API response. Optimistic updates (updating UI immediately, rolling back on error) would improve perceived performance but add complexity.

**No row-level security**: Authorization is handled entirely in API route handlers. Adding PostgreSQL row-level security policies would provide defense-in-depth but requires more setup.

---

## What Would Be Improved With More Time

1. **Pagination and infinite scroll** — Task and project lists should paginate for real-world data volumes.
2. **Real-time updates** — WebSockets or Server-Sent Events to push task updates to collaborators.
3. **Team/collaboration features** — Invite members to projects, assign tasks to specific users.
4. **Advanced kanban** — Reordering tasks within columns (not just moving between columns), swimlanes.
5. **Email notifications** — Notify users when tasks are overdue or assigned.
6. **Full test suite** — Unit tests for API routes and validation logic; integration tests for auth flows; Playwright E2E tests.
7. **Proper error boundaries** — React error boundary components with graceful fallback UI.
8. **Optimistic UI updates** — Immediate visual feedback before server confirmation.
9. **Search** — Full-text search across tasks and projects.
10. **Dark mode** — Tailwind's `dark:` variant support with a theme toggle.
