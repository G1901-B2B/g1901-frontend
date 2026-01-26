# GitGuide Frontend (Next.js)

Next.js app for **GitGuide** — create projects from GitHub URLs, browse the AI-generated roadmap, chat with a repo-aware assistant, and use a **Monaco-based workspace UI** backed by Docker workspaces.

## Tech stack (frontend)

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Clerk** authentication
- **Tailwind CSS** + Radix UI primitives
- **Monaco Editor** (`@monaco-editor/react`) for the in-browser editor

## Local development

### Prerequisites

- Node.js 18+
- Backend running locally (see repo root `LOCAL_SETUP.md`)

### Install + run

```bash
cd frontend-nextjs
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Backend URLs (local)

In dev, the app is designed to connect to:

- Main API: `http://localhost:8000`
- Workspaces API: `http://localhost:8002`

See `QUICK_START_LOCAL.md` and `LOCAL_BACKEND_CONNECTION.md` for details.

### Environment variables

Create `frontend-nextjs/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WORKSPACE_API_BASE_URL=http://localhost:8002
WORKSPACE_API_BASE_URL=http://localhost:8002

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
```

## Useful scripts

```bash
npm run dev
npm run build
npm start
npm test
```

## Code map (high level)

- `app/dashboard` — project list + creation UI
- `app/project/[projectId]` — roadmap view for a project
- `app/components/roadmap` — roadmap UI (days, concepts, tasks, kanban)
- `app/components/workspace` — editor + file explorer UI (Phase 0)
- `app/api/*` — proxy routes to backend services
- `app/lib/*` — typed API clients used by server/client components
