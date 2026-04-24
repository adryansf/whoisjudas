# Research: Extract WebSocket Server from Next.js

## Decision: Standalone Socket.IO Server with Node.js + TypeScript

### Architecture

**Selected approach**: Standalone Node.js process with `@socket.io/server`

**Rationale**:
- Node.js built-in HTTP module sufficient for Socket.IO (no additional framework needed)
- `@whoisjudas/game` provides all game logic, server handles socket event routing only
- Single responsibility: socket event handling and broadcast, no business logic in server
- User requested pnpm for package management

**Alternatives considered**:
- bun with `@socket.io/bun-engine`: Rejected - user requested Node.js + pnpm
- Express or Fastify + Socket.IO: Unnecessary - Socket.IO handles its own HTTP upgrade
- Separate worker process for game logic: Over-engineering for in-memory game state

---

## Findings

### 1. Project Structure

```
server/
├── src/
│   ├── index.ts           # Entry point, HTTP server, graceful shutdown
│   ├── socket/
│   │   ├── handler.ts     # Socket event handlers (delegates to @whoisjudas/game)
│   │   └── rooms.ts       # Room management, socket-to-player mappings
│   └── lib/
│       └── rate-limit.ts   # Rate limiting implementation
├── package.json
├── tsconfig.json
└── tests/
    ├── unit/
    └── integration/
```

### 2. Rate Limiting Pattern

Sliding window rate limiter:
- Window: 5 seconds
- Max: 20 requests per socket
- Cleanup: Every 60 seconds for expired entries

Uses in-memory Map with timestamp arrays. For multi-instance production, Redis would be needed (YAGNI for initial version).

### 3. Room Management

- `socket.join(roomCode)` for room isolation
- Maintain `playerSockets` and `socketPlayers` Maps for multi-tab support
- `socket.to(roomCode)` for broadcasting excluding sender
- `io.to(roomCode)` for broadcasting to all (including sender)

### 4. Event Type Safety

Event constants in `@whoisjudas/game/src/events.ts`:
- `ROOM_EVENTS`: room:create, room:join, room:leave
- `GAME_EVENTS`: game:start, game:timer, game:phase-change, vote:cast, judas:guess

Payload validation via Zod schemas from `@whoisjudas/game`.

### 5. Testing Strategy

| Type | Approach |
|------|----------|
| Unit | Test rate limiting, validation logic in isolation |
| Integration | `socket.io-client` connects to test server |

### 6. Graceful Shutdown Sequence

1. Stop accepting new connections / cleanup rate limit intervals
2. Clear all room timers (game phase intervals)
3. Notify clients with final events
4. Disconnect existing sockets gracefully
5. Exit process

---

## Configuration

| Item | Value |
|------|-------|
| Port | `process.env.PORT` or `3001` default |
| Rate limit window | 5000ms |
| Rate limit max | 20 requests |
| Rate limit cleanup | 60000ms interval |
| Idle timeout | Must exceed pingInterval (default 25s) |
