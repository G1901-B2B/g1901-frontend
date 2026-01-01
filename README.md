# Frontend Next.js

Next.js 16 frontend application for the AI Tutor platform. Provides a user interface for creating projects, viewing learning roadmaps, and interacting with the AI chatbot.

## Project Structure

```
app/
├── layout.tsx              # Root layout with ClerkProvider and global styles
├── page.tsx                # Homepage with hero and features
├── middleware.ts           # Route protection and authentication
│
├── dashboard/              # Dashboard page
│   ├── page.tsx           # Server component that fetches projects
│   └── loading.tsx        # Loading UI component
│
├── project/               # Project detail pages
│   ├── [projectId]/
│   │   └── page.tsx       # Project roadmap view (server component)
│   └── new/               # New project creation (future)
│
├── sign-in/               # Clerk authentication pages
│   └── [[...sign-in]]/
│       └── page.tsx
│
├── sign-up/
│   └── [[...sign-up]]/
│       └── page.tsx
│
├── components/            # React components organized by feature
│   ├── Header.tsx         # Global navigation header
│   │
│   ├── dashboard/
│   │   └── DashboardContent.tsx  # Project list and creation UI
│   │
│   ├── projects/
│   │   └── CreateProjectModal.tsx  # Project creation modal
│   │
│   ├── roadmap/           # Roadmap visualization components
│   │   ├── RoadmapPage.tsx        # Main roadmap container
│   │   ├── DayCardsStrip.tsx      # Horizontal day navigation
│   │   ├── ConceptCard.tsx        # Individual concept cards
│   │   ├── ConceptDetailPanel.tsx # Concept detail sidebar
│   │   ├── SubConceptItem.tsx     # Sub-concept list items
│   │   ├── TasksSection.tsx       # Task list display
│   │   └── KanbanBoard.tsx        # Task kanban view
│   │
│   ├── chatbot/
│   │   └── ChatbotWidget.tsx      # Chat interface component
│   │
│   └── performance/
│       └── RoutePerformanceLogger.tsx  # Route performance tracking
│
├── lib/                   # API client and utilities
│   ├── api-client.ts      # Base API client with auth helpers
│   ├── api.ts             # Main API exports
│   ├── types.ts           # TypeScript type definitions
│   ├── api-auth.ts        # Authentication API calls
│   ├── api-users.ts       # User API calls
│   ├── api-projects.ts    # Project API calls
│   ├── api-roadmap.ts    # Roadmap API calls
│   └── api-chatbot.ts    # Chatbot API calls
│
├── hooks/                 # Custom React hooks
│   ├── useRoadmap.ts      # Roadmap data fetching hook
│   └── useProgress.ts     # Progress tracking hook
│
└── utils/                 # Utility functions
    └── performance-logger.ts  # Performance monitoring utilities
```

## Architecture Overview

### Page Structure

**Server Components** (default):
- `app/page.tsx` - Homepage
- `app/dashboard/page.tsx` - Dashboard with server-side data fetching
- `app/project/[projectId]/page.tsx` - Project detail page

**Client Components** (marked with `'use client'`):
- All components in `app/components/` are client components
- Interactive UI elements (modals, forms, chat widgets)

### Authentication Flow

1. **Middleware** (`middleware.ts`): Protects routes using Clerk
   - Public routes: `/`, `/sign-in`, `/sign-up`
   - All other routes require authentication
   - Redirects unauthenticated users to sign-in

2. **Layout** (`app/layout.tsx`): Wraps app with ClerkProvider
   - Configures Clerk appearance
   - Provides global styles and fonts
   - Includes performance logger

3. **API Calls**: Use Clerk token for backend authentication
   - Server components: `auth()` from `@clerk/nextjs/server`
   - Client components: `useAuth()` hook for token

### Data Flow

**Server Components:**
```
Page Component → API Function (lib/api-*.ts) → Backend API → Render
```

**Client Components:**
```
Component → Hook (useRoadmap, useProgress) → API Function → Backend API → State Update
```

### API Client Architecture

**Base Client** (`lib/api-client.ts`):
- Handles authentication headers
- Centralized error handling
- Base URL configuration

**Feature Modules** (`lib/api-*.ts`):
- Organized by domain (projects, roadmap, chatbot)
- Type-safe API calls
- Reusable across server and client components

## Key Components

**RoadmapPage** (`components/roadmap/RoadmapPage.tsx`):
- Main container for roadmap visualization
- Manages day selection and concept display
- Coordinates between DayCardsStrip, ConceptCard, and ConceptDetailPanel

**DashboardContent** (`components/dashboard/DashboardContent.tsx`):
- Displays user's projects list
- Handles project creation via modal
- Shows project status and navigation

**ChatbotWidget** (`components/chatbot/ChatbotWidget.tsx`):
- Chat interface for RAG queries
- Manages conversation history
- Integrates with backend chatbot API

## Navigation Guide

**To add a new page:**
1. Create directory in `app/[route]/`
2. Add `page.tsx` (server component) or mark with `'use client'`
3. Update middleware if route needs protection
4. Add navigation link in `components/Header.tsx` if needed

**To add a new API endpoint:**
1. Create function in `app/lib/api-[feature].ts`
2. Export from `app/lib/api.ts`
3. Use in components or hooks

**To modify roadmap display:**
1. Update components in `app/components/roadmap/`
2. Modify data fetching in `app/hooks/useRoadmap.ts`
3. Adjust types in `app/lib/types.ts` if schema changes

**To add a new feature component:**
1. Create directory in `app/components/[feature]/`
2. Build component with proper TypeScript types
3. Import and use in relevant pages

**To change authentication behavior:**
1. Modify `middleware.ts` for route protection
2. Update `app/layout.tsx` for Clerk configuration
3. Adjust API client auth in `lib/api-client.ts`

## Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Testing
npm test
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key (for server-side)

## Styling

- Tailwind CSS v4 for styling
- Custom CSS in `app/globals.css`
- Geist font family for typography
- Dark theme with zinc color palette
