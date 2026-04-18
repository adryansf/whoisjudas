# whoisjudas Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-11

## Active Technologies
- TypeScript 5.x + Next.js 15 (App Router), Socket.IO, React Query, shadcn/ui, next-intl, nanoid (001-social-deduction-game)
- Local JSON files for game data (stories, characters); In-memory for game state (001-social-deduction-game)
- TypeScript 5.x + Next.js 16 (App Router), TailwindCSS, shadcn/ui components (002-biblical-game-ui-remodel)
- N/A (UI-only feature) (002-biblical-game-ui-remodel)
- TypeScript 5.x + Socket.IO, Next.js 16 (App Router) (003-fix-multi-tab-socket)
- In-memory (rooms, players in `@whoisjudas/game`) (003-fix-multi-tab-socket)
- TypeScript 5.x + `@socket.io/server`, `@whoisjudas/game` (004-extract-websocket-server)
- N/A (in-memory, game state managed by @whoisjudas/game) (004-extract-websocket-server)
- N/A (in-memory, managed by @whoisjudas/game) (004-extract-websocket-server)

- TypeScript 5.x + Next.js 16 (App Router), Socket.IO, React Query, shadcn/ui, next-intl (001-social-deduction-game)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x: Follow standard conventions

## Recent Changes
- 004-extract-websocket-server: Added TypeScript 5.x + `@socket.io/server`, `@whoisjudas/game`
- 004-extract-websocket-server: Added TypeScript 5.x + `@socket.io/server`, `@whoisjudas/game`
- 003-fix-multi-tab-socket: Added TypeScript 5.x + Socket.IO, Next.js 16 (App Router)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
