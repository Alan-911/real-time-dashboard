# Real-Time Field Operations Command Center

[![CI](https://github.com/Alan-911/real-time-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Alan-911/real-time-dashboard/actions/workflows/ci.yml) [![Security](https://github.com/Alan-911/real-time-dashboard/actions/workflows/security.yml/badge.svg)](https://github.com/Alan-911/real-time-dashboard/actions/workflows/security.yml)

**Next.js 16 · React 19 · TypeScript · Supabase Realtime · React Query**

[Live demonstration](https://real-time-dashboard-blush.vercel.app/) · [Application code](src/app/DashboardClient.tsx) · [Reporting](src/lib/reportService.ts)

## Operations dashboard design preview

![Operations Command Hub — real-time location map, performance analytics, and job allocation table](https://d2ol7oe51mr4n9.cloudfront.net/user_3BjvznL67PSnqP9w6BCX0wqGk5P/89328544-264e-4a2d-830f-e91d9825c0d6.png)

*Design reference supplied for this project, showing a proposed location map, performance analytics, and job-allocation interface. This is **not a verified screenshot of the deployed application**; the current implementation focuses on task tracking, Supabase Realtime updates, execution logs, and PDF reporting. [View the live implementation](https://real-time-dashboard-blush.vercel.app/).*

## Overview

A full-stack dashboard prototype for managing and monitoring **field operations and assigned interventions**. It displays task priorities, assigned agents, status changes, execution logs and operational summaries.

Unlike a polling-based dashboard, the application subscribes to Supabase PostgreSQL change events and updates connected views when records are inserted, changed or deleted. The interface also supports optimistic status changes with rollback on API errors.

**Important:** This is an **operations demonstration**. The initial field missions and log entries are synthetic examples; an “agent” assignment field does not mean an actual autonomous agent is executing a mission.

## Features verified in the code

| Capability | Source | Notes |
| --- | --- | --- |
| PostgreSQL change subscriptions | [DashboardClient.tsx](src/app/DashboardClient.tsx) | Handles INSERT, UPDATE and DELETE via Supabase Realtime |
| Optimistic updates and rollback | [DashboardClient.tsx](src/app/DashboardClient.tsx) | React Query mutation lifecycle |
| Task assignment, filtering and priority | [TaskCard.tsx](src/components/TaskCard.tsx) | Interactive task presentation |
| Execution log inspection | [AgentLogPanel.tsx](src/components/AgentLogPanel.tsx) | Displays stored task log entries |
| Shift reports and PDF output | [reportService.ts](src/lib/reportService.ts), [pdfGenerator.ts](src/lib/pdfGenerator.ts) | Report-generation code |
| Connection troubleshooting | [diagnose-supabase.mjs](scripts/diagnose-supabase.mjs) | Supabase configuration and diagnostic checks |

## Architecture

```text
Supabase PostgreSQL — todos table
              │
       Supabase Realtime
              │ INSERT / UPDATE / DELETE
              ▼
     Next.js client application
              │
    React Query cache + optimistic UI
              │
    Operations board / log panels
              │
       Shift report → PDF
```

[Application entry point](src/app/page.tsx) renders `DashboardClient.tsx`, where the current real-time subscription and state management live.

## Get started

```bash
git clone https://github.com/Alan-911/real-time-dashboard.git
cd real-time-dashboard
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Create a Supabase table with fields matching [Todo](src/types/database.types.ts): `id` (UUID), `title`, `status`, `priority`, `assigned_agent`, `updated_at`, plus a `logs` JSONB array for the log panel.

Configure PostgreSQL Realtime replication on `todos` and establish appropriate Row Level Security policies **before** exposing a writable instance. Do not place a service-role secret in a public client environment variable.

```bash
npm run dev
# open http://localhost:3000
```

## Demonstration data and metrics

- If the database is empty, the client displays generated field-operation examples and attempts to seed them into Supabase.
- Seeding may fail under restrictive RLS; in that case, the interface can still display local examples.
- “Estimated beneficiaries” is calculated using fixed priority weights.
- “Asset uptime” is a simulated indicator derived from task completion and logs, **not measured infrastructure availability**.
- “Peak latency” in reports is an illustrative calculation, **not a measured end-to-end response time**.

The realtime transport is implemented, but **no independently measured sub-50 ms propagation benchmark** is included. Do not describe that number as a verified performance result.

## Current limitations

- No dedicated automated test suite or GitHub Actions CI workflow is present in this repository.
- Authentication, authorization and user-specific Row Level Security need to be configured and documented for real operational use.
- Demo seeding should be explicitly separated from real data.
- Supabase subscriptions need more explicit connection-state and reconnection reporting.
- The current app demonstrates human/agent-assigned tasks, not independent agent execution.

## Engineering priorities

1. Implement a safe demo-mode switch instead of inserting demonstration records into an empty live database.
2. Document a reproducible database migration and RLS access policies.
3. Add automated tests for mutations, subscriptions and report calculations.
4. Add CI and measurable latency instrumentation.
5. Replace simulated operational KPIs with measured data when a real source is available.

## Project status

**Working full-stack operations prototype** with database-backed realtime updates. Not a deployed emergency-response system or a verified high-availability production service.

**Maintainer:** Yves Alain Iragena · [Portfolio](https://alan-911.github.io/my-portfolio/)


## Repository quality and security

- [Continuous integration](.github/workflows/ci.yml), [CodeQL and secret scanning](.github/workflows/security.yml).
- [Security reporting policy](SECURITY.md) and [contribution guidelines](CONTRIBUTING.md).
- Automated checks cannot replace Supabase RLS policies, authentication and deployment review; see [Supabase access-control checklist](docs/security/supabase-access.md).
- **Unresolved dependency advisories:** The latest lockfile audit reported high/critical findings; see the [dated audit evidence and remediation plan](docs/security/dependency-audit.md). The dependency audit job intentionally fails until these are addressed.
- Licensing for reuse should be confirmed with the project owner; no new license is granted by these workflow updates.
