# Real-Time Analytics Dashboard

> Live telemetry and analytics UI with sub-50ms WebSocket event propagation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://docker.com)
[![Latency](https://img.shields.io/badge/Event%20Latency-%3C50ms-brightgreen.svg)]()

## Overview

A production-ready analytics dashboard built for real-time data — events appear on screen within 50ms of occurring, with no polling. Designed for operational monitoring, sales telemetry, or any use case where stale data is worse than no data.

## Features

- **Sub-50ms event delivery** via persistent WebSocket connections
- **Live charts** — line, bar, and metric cards update in real time without page refresh
- **Multi-source ingestion** — connect any event stream via the REST or WebSocket API
- **Responsive layout** — works on desktop and tablet
- **Containerised** — single `docker compose up` for local or cloud deployment

## Demo

```
Event emitted → WebSocket server → all connected clients updated → chart re-renders
Total time: < 50ms (measured on local network)
```

## Quick Start

```bash
git clone https://github.com/Alan-911/real-time-dashboard
cd real-time-dashboard

# Docker (recommended)
docker compose up

# Manual
npm install
npm run dev        # http://localhost:3000

# Send a test event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"metric": "page_views", "value": 142, "timestamp": "2026-05-21T10:00:00Z"}'
```

## Stack

`Next.js 14` `TypeScript` `WebSockets` `Supabase` `Tailwind CSS` `Docker` `Recharts`

---

Built by [Yves Alain Iragena](https://alan-911.github.io/my-portfolio)
