# Real-Time Operations Dashboard

**[🚀 Live Demo →](https://real-time-dashboard-blush.vercel.app)**

[![Live Demo](https://img.shields.io/badge/Demo-Live-22c55e.svg)](https://real-time-dashboard-blush.vercel.app)

> A live task board where database changes appear on screen instantly — no polling, no refresh. Built with Next.js 16, Supabase Realtime, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e.svg)](https://supabase.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38bdf8.svg)](https://tailwindcss.com)

---

## What It Does

An operations dashboard for tracking agent-assigned tasks in real time. When a task is created, updated, or completed — in the database, by any agent or user — every connected browser updates within milliseconds. No page refresh. No polling loop.

Built as the monitoring frontend for a multi-agent system where tasks are assigned to named agents, carry priorities, and need live status visibility across a team.

---

## How the Realtime Works

Supabase exposes Postgres changes over a WebSocket channel. This app subscribes to `INSERT`, `UPDATE`, and `DELETE` events on the `todos` table and applies them directly to React state:

```typescript
// src/app/page.tsx
const subscription = supabase
  .channel('todos-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setTodos((prev) => [payload.new as Todo, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setTodos((prev) =>
          prev.map((todo) => todo.id === payload.new.id ? payload.new as Todo : todo)
        )
      } else if (payload.eventType === 'DELETE') {
        setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id))
      }
    }
  )
  .subscribe()
```

**Why this matters:** `postgres_changes` fires on every committed transaction — not on a timer. Latency is bounded by the Postgres commit → Supabase Realtime propagation path, typically **under 50ms** on a local or regional deployment.

---

## Optimistic UI Updates

When a user clicks the status toggle, the UI updates immediately — before the database confirms the write. If the write fails, state rolls back automatically:

```typescript
const toggleStatus = async (id: string, currentStatus: string) => {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

  // 1. Update local state instantly (optimistic)
  setTodos((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t))

  // 2. Persist to Supabase
  const { error } = await supabase
    .from('todos')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  // 3. Roll back if write failed
  if (error) fetchTodos()
}
```

This gives the UI instant feel while keeping the database as source of truth.

---

## Data Model

```typescript
// src/types/database.types.ts
export type Todo = {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assigned_agent: string | null   // which AI agent owns this task
  updated_at: string
}
```

Tasks are colored by priority (red = high, amber = medium, green = low) and show the assigned agent name and relative timestamp (e.g. "3 minutes ago").

---

## UI Details

Each task card renders:
- **Status indicator bar** (top of card) — green when completed, gray when pending
- **Priority badge** — color-coded with `AlertTriangle` icon
- **Assigned agent chip** — which agent is responsible
- **Relative timestamp** — `formatDistanceToNow` from `date-fns`
- **Toggle button** — `CheckCircle2` / `Circle` with instant optimistic update
- **Hover animation** — subtle lift (`-translate-y-1`) on hover

**Live indicator** in the header: animated ping dot + "SYSTEM ONLINE" badge that reflects the Supabase channel connection state.

---

## Quick Start

```bash
git clone https://github.com/Alan-911/real-time-dashboard
cd real-time-dashboard
npm install
```

**Configure Supabase:**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Create the table in Supabase SQL editor:**

```sql
create table todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text default 'pending' check (status in ('pending', 'completed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_agent text,
  updated_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table todos;
```

```bash
npm run dev
# http://localhost:3000

# Insert a task from another terminal to see live update:
# (or use Supabase Table Editor)
```

---

## Repo Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard — realtime subscription + task cards
│   │   ├── layout.tsx        # Root layout + global font
│   │   └── globals.css       # CSS variables: --background, --card, --accent, etc.
│   ├── lib/
│   │   └── supabase.ts       # Supabase client (env-configured)
│   └── types/
│       └── database.types.ts # Todo type definition
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Stack

`Next.js 16` · `React 19` · `TypeScript 5` · `Supabase Realtime` · `Tailwind CSS 4` · `Lucide React` · `date-fns`

---

Built by [Yves Alain Iragena](https://alan-911.github.io/my-portfolio) · MAIL Lab, Catholic University of America · iragena@cua.edu
