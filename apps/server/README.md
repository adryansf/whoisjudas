# WhoIsJudas WebSocket Server

Standalone Socket.IO server for the WhoIsJudas social deduction game.

## Quick Start

```bash
pnpm install
pnpm dev
```

Server starts on `http://localhost:3001` by default.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

## Architecture

- `src/index.ts` - HTTP server with Socket.IO setup
- `src/socket/handler.ts` - Socket.IO event handlers
- `src/socket/rooms.ts` - Room management
- `src/lib/rate-limit.ts` - Rate limiting
- `@whoisjudas/game` - Game logic

## Events

See `specs/004-extract-websocket-server/contracts/events.md` for full event documentation.
