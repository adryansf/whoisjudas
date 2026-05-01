# whoisjudas Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-30

## Live Site
**https://whoisjudas.adryanfreitas.dev/**

## Active Technologies
- TypeScript 5.x + Next.js 16 (App Router), Socket.IO, React Query, shadcn/ui, next-intl, @vercel/analytics
- Local JSON files for game data (stories, characters); In-memory for game state

## Project Structure

```text
apps/
  web/          # Next.js frontend
  server/       # Socket.IO server
packages/
  game/         # Game logic
  data/         # Story/character data
  ui/           # shadcn/ui components
  env/          # Environment config
```

## Commands

```bash
npm run dev        # Development
npm run build      # Production build
npm run check       # Biome lint
```

## Code Style

TypeScript 5.x: Follow standard conventions

## Recent Changes
- 006-vercel-analytics: Added @vercel/analytics, removed server.ts, removed @orpc/*
- 005-rules-modal-button: Added TypeScript 5.x + Next.js 16 App Router, shadcn/ui (Dialog component), next-intl
- 004-extract-websocket-server: Added TypeScript 5.x + `@socket.io/server`, `@whoisjudas/game`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->