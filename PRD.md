# FlowMind — AI-Powered Project & Task Manager
## Complete Build Requirements Document

---

## 1. PROJECT OVERVIEW

Build a **production-grade, full-stack AI-powered project and task management SaaS** called **FlowMind**. This is NOT a basic CRUD app. It is a sophisticated project management tool with deeply integrated AI features, nested data structures, real-time Kanban boards, and intelligent automation.

The application must demonstrate:
- Strong system design and relational data modeling
- Secure, scalable backend architecture using Next.js 16 API routes
- Polished, responsive, accessible UI using Tailwind CSS + shadcn/ui
- AI integration as a core workflow feature (not an add-on)
- Production-ready deployment on Vercel with CI/CD

**Live use case:** A team or individual manages multiple projects, each containing tasks and subtasks. AI helps break down goals into actionable tasks, generates daily standup summaries, and suggests priorities.

---

## 2. TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict mode) |
| Styling | Tailwind CSS v3 + shadcn/ui + Radix UI primitives |
| Database | PostgreSQL (hosted on Neon or Supabase free tier) |
| ORM | Prisma v5 |
| Authentication | NextAuth.js v5 (Auth.js) — credentials + Google OAuth |
| AI | Google Gemini 1.5 Flash via `@ai-sdk/google` + Vercel AI SDK |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Form Handling | React Hook Form + Zod validation |
| State Management | Zustand (global UI state) + TanStack Query v5 (server state) |
| Date Handling | date-fns |
| Icons | Lucide React |
| Deployment | Vercel (with GitHub Actions CI/CD) |
| Testing | Vitest + React Testing Library (unit), Playwright (e2e) |

**Package manager:** pnpm

---

## 3. DATABASE SCHEMA (Prisma)

Create the following Prisma schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // hashed with bcrypt, null for OAuth users
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  projects      Project[]
  tasks         Task[]    @relation("AssignedTasks")
  ownedTasks    Task[]    @relation("CreatedTasks")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?       @db.Text
  color       String        @default("#6366f1") // hex color for visual identity
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks       Task[]

  @@index([userId])
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  position    Int        @default(0) // for ordering within a column
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdById String
  createdBy   User       @relation("CreatedTasks", fields: [createdById], references: [id])

  assigneeId  String?
  assignee    User?      @relation("AssignedTasks", fields: [assigneeId], references: [id])

  parentId    String?
  parent      Task?      @relation("SubTasks", fields: [parentId], references: [id])
  subtasks    Task[]     @relation("SubTasks")

  tags        Tag[]
  aiGenerated Boolean    @default(false) // flag AI-generated tasks

  @@index([projectId])
  @@index([createdById])
  @@index([status])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Tag {
  id    String @id @default(cuid())
  name  String
  color String @default("#94a3b8")
  tasks Task[]

  @@unique([name])
}
```

Run: `npx prisma migrate dev --name init` and `npx prisma generate`

---

## 4. PROJECT FOLDER STRUCTURE

```
flowmind/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard shell with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Overview: stats + recent activity
│   │   ├── projects/
│   │   │   ├── page.tsx            # All projects grid
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create project
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx        # Kanban board for project
│   │   │       ├── list/
│   │   │       │   └── page.tsx    # List view for tasks
│   │   │       └── settings/
│   │   │           └── page.tsx    # Edit/delete project
│   │   └── settings/
│   │       └── page.tsx            # User profile/settings
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts            # GET all, POST create
│   │   │   └── [projectId]/
│   │   │       ├── route.ts        # GET one, PATCH, DELETE
│   │   │       └── tasks/
│   │   │           ├── route.ts    # GET tasks, POST create task
│   │   │           └── [taskId]/
│   │   │               └── route.ts # GET, PATCH, DELETE task
│   │   ├── tasks/
│   │   │   └── [taskId]/
│   │   │       ├── route.ts        # PATCH status/position (Kanban drag)
│   │   │       └── subtasks/
│   │   │           └── route.ts    # GET, POST subtasks
│   │   └── ai/
│   │       ├── breakdown/
│   │       │   └── route.ts        # AI goal → subtask breakdown
│   │       └── standup/
│   │           └── route.ts        # AI standup summary generator
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui auto-generated components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── RecentActivity.tsx
│   │   └── ProjectProgressBar.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── CreateProjectDialog.tsx
│   │   └── ProjectColorPicker.tsx
│   ├── tasks/
│   │   ├── KanbanBoard.tsx         # Main Kanban with dnd-kit
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── TaskListView.tsx
│   │   ├── TaskDetailSheet.tsx     # Side sheet for viewing/editing task
│   │   ├── CreateTaskDialog.tsx
│   │   ├── SubtaskList.tsx
│   │   ├── PriorityBadge.tsx
│   │   └── StatusBadge.tsx
│   ├── ai/
│   │   ├── AIBreakdownDialog.tsx   # Goal input → AI task generation
│   │   └── StandupSummaryCard.tsx  # Rendered AI standup
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ConfirmDialog.tsx
│       └── DatePicker.tsx
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── auth.ts                     # NextAuth config
│   ├── validations/
│   │   ├── project.ts              # Zod schemas for projects
│   │   └── task.ts                 # Zod schemas for tasks
│   ├── utils.ts                    # cn(), formatDate(), etc.
│   └── ai/
│       └── gemini.ts               # Gemini client setup
├── hooks/
│   ├── useProjects.ts              # TanStack Query hooks
│   ├── useTasks.ts
│   └── useAI.ts
├── store/
│   └── ui.store.ts                 # Zustand: sidebar open, active view
├── types/
│   └── index.ts                    # Shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # Demo data seeder
├── __tests__/
│   ├── unit/
│   │   ├── validations.test.ts
│   │   └── utils.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       └── task-crud.spec.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn config
└── package.json
```

---

## 5. ENVIRONMENT VARIABLES

Create `.env.local` (and `.env.local.example` for the repo):

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/flowmind?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# Google OAuth (optional but implement it)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

---

## 6. AUTHENTICATION

Use **NextAuth.js v5 (Auth.js)** with the following configuration in `lib/auth.ts`:

- **Credentials Provider**: Email + password login. Hash passwords with `bcryptjs` (salt rounds: 12). On registration, validate email uniqueness, hash password, store user.
- **Google OAuth Provider**: Full OAuth flow. On first login via Google, auto-create user record.
- **Session Strategy**: JWT (not database sessions — simpler for this scale).
- **Middleware**: Protect all `/dashboard/*` and `/projects/*` routes. Unauthenticated users redirect to `/login`.
- **Registration**: Separate `/register` page with form: name, email, password, confirm password. Validate with Zod (min 8 chars password, valid email).
- **Error handling**: Show clear error messages on invalid credentials.

```ts
// lib/auth.ts outline
export const authOptions = {
  providers: [
    CredentialsProvider({ ... }),
    GoogleProvider({ ... }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) { if (user) token.id = user.id; return token; },
    session({ session, token }) { session.user.id = token.id; return session; },
  },
}
```

---

## 7. API ROUTES — FULL SPECIFICATION

### Authentication guard
Every API route must start by verifying the session:
```ts
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### 7.1 Projects API

**GET `/api/projects`**
- Returns all projects belonging to `session.user.id`
- Include `_count: { tasks: true }` to show task counts
- Order by `updatedAt DESC`

**POST `/api/projects`**
- Body: `{ name, description?, color?, status? }`
- Validate with Zod: name required (3–50 chars), color must be valid hex
- Create project with `userId: session.user.id`
- Return created project

**GET `/api/projects/[projectId]`**
- Verify project belongs to current user (return 403 if not)
- Include tasks with their subtask counts

**PATCH `/api/projects/[projectId]`**
- Partial update: any combination of name, description, color, status
- Validate ownership

**DELETE `/api/projects/[projectId]`**
- Validate ownership
- Prisma cascade will delete all tasks

### 7.2 Tasks API

**GET `/api/projects/[projectId]/tasks`**
- Return all tasks for project grouped by status
- Include subtask count, tags, assignee
- Support query param `?view=kanban` (grouped) or `?view=list` (flat, sorted by priority then dueDate)

**POST `/api/projects/[projectId]/tasks`**
- Body: `{ title, description?, status?, priority?, dueDate?, parentId? }`
- title required (1–100 chars)
- If `parentId` provided, verify parent task exists in same project
- Set `createdById: session.user.id`
- Auto-set `position` as max(position) + 1 within that status column

**PATCH `/api/tasks/[taskId]`**
- Handles: title, description, status, priority, dueDate, assigneeId, position updates
- **For Kanban drag-drop**: Accept `{ status, position }` and reorder tasks within column
  - When status changes, reindex positions in both old and new column
- Validate task belongs to user's project

**DELETE `/api/tasks/[taskId]`**
- Also deletes all subtasks (cascade in Prisma)

**GET/POST `/api/tasks/[taskId]/subtasks`**
- List or create subtasks under a parent task

### 7.3 AI Routes

**POST `/api/ai/breakdown`**
```ts
// Body: { goal: string, projectId: string }
// Calls Gemini with a structured prompt
// Returns: { tasks: Array<{ title, description, priority, estimatedMinutes }> }
// After AI response, save generated tasks to DB with aiGenerated: true
```

**POST `/api/ai/standup`**
```ts
// Body: { projectId: string }
// Fetches all IN_PROGRESS and recently completed tasks (last 24h)
// Sends to Gemini for summary
// Returns: { summary: string } — formatted markdown standup text
```

---

## 8. AI FEATURES — DETAILED IMPLEMENTATION

### 8.1 Setup Gemini with Vercel AI SDK

```ts
// lib/ai/gemini.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const geminiFlash = gemini('gemini-1.5-flash');
```

### 8.2 AI Task Breakdown

**UI:** A floating button labeled "✨ AI Breakdown" on the project Kanban page. Clicking opens a dialog (`AIBreakdownDialog.tsx`) with:
- A large textarea: "Describe your goal or feature..."
- A "Generate Tasks" button
- Loading state with skeleton cards
- Generated tasks shown as preview cards, each with: title, description, priority badge
- "Add All to Board" button → calls API to persist all tasks
- "Dismiss" option per task

**Prompt to Gemini (in `/api/ai/breakdown/route.ts`):**
```
You are a project management AI. Break down the following goal into concrete, actionable tasks for a software team.

Goal: ${goal}

Respond ONLY with a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "title": "Short action-oriented task title (max 60 chars)",
    "description": "Clear description of what needs to be done (1-2 sentences)",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "estimatedMinutes": number
  }
]

Rules:
- Generate 4 to 8 tasks
- Make titles start with action verbs (Design, Implement, Test, Review, etc.)
- Vary priorities based on logical dependency and importance
- Keep tasks independent and completable in 1 day or less
```

Parse the JSON response and return it. Handle parse errors gracefully.

### 8.3 AI Standup Summary

**UI:** A "Generate Standup" button on the project page. Clicking generates a card (`StandupSummaryCard.tsx`) showing:
- Formatted markdown: What was done, what's in progress, blockers (if overdue tasks)
- A "Copy to Clipboard" button
- Timestamp of generation

**Prompt to Gemini (in `/api/ai/standup/route.ts`):**
```
You are a helpful project management assistant. Generate a concise daily standup summary based on the following task data.

Project: ${project.name}
Date: ${new Date().toLocaleDateString()}

Completed recently (last 24h):
${completedTasks.map(t => `- ${t.title}`).join('\n') || 'None'}

Currently In Progress:
${inProgressTasks.map(t => `- ${t.title} (Priority: ${t.priority})`).join('\n') || 'None'}

Overdue Tasks:
${overdueTasks.map(t => `- ${t.title} (Due: ${t.dueDate})`).join('\n') || 'None'}

Write a professional standup update in this format:
**Yesterday:** [what was completed]
**Today:** [what's in progress]  
**Blockers:** [overdue or at-risk items, or "None"]

Keep it concise (under 100 words total). Use plain language.
```

---

## 9. KANBAN BOARD IMPLEMENTATION

Use `@dnd-kit/core` and `@dnd-kit/sortable`. The board has 4 columns: **TODO**, **IN PROGRESS**, **IN REVIEW**, **DONE**.

### Architecture:
- `KanbanBoard.tsx` — holds all state, DndContext, column data
- `KanbanColumn.tsx` — SortableContext for each status column, droppable
- `KanbanCard.tsx` — draggable task card

### Drag behavior:
- Drag cards within a column → reorder (update `position`)
- Drag cards between columns → update `status` + reorder
- On drag end, optimistically update UI, then PATCH `/api/tasks/[taskId]` with new status + position
- If API call fails, rollback UI state

### KanbanCard content:
- Task title (truncated at 2 lines)
- Priority badge (color-coded: URGENT=red, HIGH=orange, MEDIUM=blue, LOW=gray)
- Due date (red if overdue, orange if due today)
- Subtask count badge (e.g., "3/5 subtasks")
- AI-generated indicator (✨ icon) if `aiGenerated: true`
- Click card → opens `TaskDetailSheet` (side panel)

### KanbanColumn header:
- Status name
- Task count badge
- "+" button to quick-create a task in that column

---

## 10. TASK DETAIL SHEET

A `Sheet` component (shadcn) that slides in from the right when clicking a task card. Contains:

**Header:**
- Task title (inline editable — click to edit)
- Close button
- Delete button (with confirm dialog)

**Body sections:**
1. **Description** — textarea, auto-saves on blur
2. **Properties panel** (grid layout):
   - Status — Select dropdown
   - Priority — Select dropdown
   - Due Date — DatePicker
   - Project — read-only link
3. **Subtasks** section:
   - List of subtasks with checkboxes (checking = marks DONE)
   - Inline "Add subtask" input at bottom
   - Progress bar: completed/total subtasks
4. **AI Breakdown** — small button: "✨ Break this task down with AI" → runs AI breakdown using this task's title as the goal, adds results as subtasks

---

## 11. UI/UX DESIGN SPECIFICATION

### Design Language:
- **Theme**: Dark-first, with a clean light mode toggle
- **Dark background**: `#0f1117` (near black), sidebar `#13151c`
- **Accent color**: `#6366f1` (indigo-500) for primary actions
- **Font**: `Geist` (Next.js default) for body; `Geist Mono` for code/IDs
- **Border radius**: `rounded-lg` (8px) for cards, `rounded-xl` (12px) for dialogs
- **Shadows**: Subtle `shadow-sm` on cards, deeper `shadow-lg` on dialogs

### Sidebar (desktop, collapsible):
- Logo "FlowMind" with a small infinity/flow icon
- Nav items: Dashboard, Projects (expandable list), Settings
- User avatar + name at bottom with logout option
- Collapsible to icon-only mode (store state in Zustand)

### Dashboard Page (`/dashboard`):
- Greeting: "Good morning, [Name] 👋"
- Stats row: Total Projects, Active Tasks, Completed Today, Overdue
- "Your Projects" grid (3 columns) — ProjectCard with color bar, name, task count, progress bar
- "Recent Activity" feed (last 10 task updates)

### Projects Grid Page (`/projects`):
- "New Project" button top-right → opens `CreateProjectDialog`
- Cards with: colored top border, project name, description (truncated), task count, status badge, "Open Board" CTA
- Filter tabs: All / Active / Completed / Archived

### Kanban Page (`/projects/[projectId]`):
- Breadcrumb: Projects → [Project Name]
- Header: project name, color dot, "✨ AI Breakdown" button, view toggle (Kanban / List), settings icon
- Horizontally scrollable Kanban board on mobile
- Column headers sticky on scroll

### Responsive breakpoints:
- Mobile (< 768px): Single column task list, bottom nav instead of sidebar, Kanban scrolls horizontally
- Tablet (768–1024px): Collapsed sidebar, 2-column project grid
- Desktop (> 1024px): Full sidebar, 3-column project grid, full Kanban

### Loading states:
- Skeleton loaders for all data-fetching states (never show raw spinners alone)
- Optimistic UI updates for task status changes
- Toast notifications (shadcn Toaster) for all create/update/delete/error events

### Empty states:
- Illustrated empty states (use inline SVG illustrations) for: no projects, no tasks in a column, no search results

---

## 12. FORM VALIDATION (ZOD SCHEMAS)

```ts
// lib/validations/project.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color").default("#6366f1"),
  status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).default("ACTIVE"),
});

export const updateProjectSchema = createProjectSchema.partial();

// lib/validations/task.ts
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title required").max(100),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  position: z.number().int().min(0).optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

---

## 13. ERROR HANDLING STRATEGY

### API routes:
- Wrap all handlers in try/catch
- Return consistent error shape: `{ error: string, details?: any }`
- Status codes: 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server error)
- Log errors server-side with `console.error` (or integrate a logger)

### Client-side:
- TanStack Query's `onError` callbacks → show toast notifications
- Form errors displayed inline using React Hook Form `formState.errors`
- Network errors: show a retry button in the UI
- AI failures: show a user-friendly message "AI is unavailable, try again"

### Specific guards:
- User can only access their own projects (check `userId` on every query)
- Validate all `[projectId]` and `[taskId]` params are valid CUIDs before DB query
- Sanitize all string inputs (trim whitespace, strip HTML)

---

## 14. PERFORMANCE OPTIMIZATIONS

- Use Next.js **Server Components** for all static/data-fetching pages (dashboard, project list)
- Use **Client Components** only for interactive parts (Kanban, forms, dialogs)
- **TanStack Query** caching: `staleTime: 1000 * 60` (1 min) for project/task data
- **Optimistic updates** for Kanban drag-drop (no waiting for API)
- **Code splitting**: Dynamic imports for heavy components (Kanban, AI dialogs)
  ```ts
  const KanbanBoard = dynamic(() => import('@/components/tasks/KanbanBoard'), { ssr: false });
  ```
- **Image optimization**: Use `next/image` for user avatars
- **Database indexes**: Already defined in Prisma schema on `userId`, `projectId`, `status`
- **Pagination**: Task list view should paginate at 20 tasks per page

---

## 15. SECURITY IMPLEMENTATION

- **Password hashing**: bcryptjs with 12 salt rounds
- **Input sanitization**: Trim and strip all inputs before saving to DB
- **CSRF**: NextAuth handles this automatically
- **Rate limiting**: Add a simple in-memory rate limiter on `/api/ai/*` routes (max 10 req/min per user)
  ```ts
  // Simple rate limit check using a Map in module scope
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  ```
- **Authorization checks**: Every API route verifies resource ownership
- **Environment secrets**: Never expose `GOOGLE_GENERATIVE_AI_API_KEY` or `NEXTAUTH_SECRET` to the client
- **Headers**: Add security headers in `next.config.ts`:
  ```ts
  headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, ...]
  ```
- **SQL injection**: Prisma parameterized queries prevent this by default

---

## 16. TESTING

### Unit tests (Vitest):
```
__tests__/unit/
├── validations.test.ts   # Test all Zod schemas (valid/invalid inputs)
└── utils.test.ts         # Test utility functions (formatDate, cn, etc.)
```

### E2E tests (Playwright):
```
__tests__/e2e/
├── auth.spec.ts          # Register, login, logout flows
└── task-crud.spec.ts     # Create project, create task, move on Kanban, delete
```

Minimum test coverage to include:
- Register with invalid data → shows errors
- Login with wrong password → shows error  
- Login success → redirects to dashboard
- Create project → appears in grid
- Create task → appears in TODO column
- Drag task to IN_PROGRESS → status updates

---

## 17. CI/CD (GITHUB ACTIONS)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:unit
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

Set GitHub repository secrets: `DATABASE_URL`, `NEXTAUTH_SECRET`

Vercel auto-deploys from `main` branch via the Vercel GitHub integration.

---

## 18. SEED DATA

Create `prisma/seed.ts` to populate demo data:
- 1 demo user: `demo@flowmind.app` / `Demo1234`
- 3 projects: "Product Redesign", "API Development", "Marketing Q1"
- 10–15 tasks spread across columns with various priorities
- 2–3 subtasks on some tasks

Run with: `npx prisma db seed`

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## 19. FOOTER (MANDATORY)

Every page must include a footer with:
```
Built by [Your Name] · GitHub: github.com/[username] · LinkedIn: linkedin.com/in/[username]
```
Style it subtly — small text, muted color, centered, with external link icons.

---

## 20. PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed",
    "postinstall": "prisma generate"
  }
}
```

---

## 21. `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 22. DEPLOYMENT CHECKLIST

Before submitting:
- [ ] App is live on Vercel with a public URL
- [ ] All environment variables set in Vercel dashboard
- [ ] Database is live (Neon/Supabase), migrations applied
- [ ] Demo credentials work: `demo@flowmind.app` / `Demo1234`
- [ ] GitHub repo is public with a detailed README
- [ ] README includes: project description, tech stack, setup instructions, env vars table, live demo link, screenshots
- [ ] Footer has your name, GitHub, and LinkedIn
- [ ] CI/CD pipeline passing on GitHub Actions
- [ ] Google OAuth configured with correct redirect URIs for production domain

---

## 23. README STRUCTURE

````markdown
# FlowMind — AI-Powered Project Manager

> Live Demo: https://flowmind.vercel.app

## Features
- ...

## Tech Stack
- ...

## Getting Started
```bash
git clone ...
pnpm install
cp .env.local.example .env.local
# fill in env vars
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Environment Variables
| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| ... | ... |

## Screenshots
[Add screenshots here]
````

---