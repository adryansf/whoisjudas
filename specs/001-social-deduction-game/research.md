# Research: Who Is Judas? - Social Deduction Game

**Feature**: 001-social-deduction-game
**Date**: 2026-03-14

## Technology Decisions

### WebSocket Solution: Socket.IO

**Decision**: Use Socket.IO for real-time communication.

**Rationale**:
- Built-in reconnection handling
- Fallback to HTTP long-polling
- Rooms/namespace support for game isolation
- Well-documented, mature library
- TypeScript support

**Alternatives Considered**:
- Raw WebSockets: More control but requires manual reconnection, room management
- Pusher/Ably: Third-party service adds dependency and cost
- PartyKit: Newer, less mature, adds infrastructure complexity

### Internationalization: next-intl

**Decision**: Use next-intl for i18n.

**Rationale**:
- Designed for Next.js App Router
- Server and client component support
- Built-in routing with `[locale]` segment
- ICU message format
- Active maintenance

**Alternatives Considered**:
- next-i18next: Designed for Pages Router, requires workarounds for App Router
- react-intl: Works but lacks Next.js routing integration

### State Management: React Query + React State

**Decision**: Use React Query for server state, React state for game state.

**Rationale**:
- React Query already in project
- Game state is ephemeral (per session), doesn't need persistence
- Socket.IO events update local state directly
- Keeps architecture simple

**Alternatives Considered**:
- Zustand: Adds another state library
- Redux: Overkill for this scope

### Data Storage: Local JSON Files

**Decision**: Store biblical stories and characters in local JSON files.

**Rationale**:
- Per user requirement: no database
- Static content, changes infrequently
- Easy to update without deployment (could be fetched at runtime later)
- Supports i18n with separate files per language

**Implementation**:
- `packages/data/src/stories/en.json` - English stories
- `packages/data/src/stories/pt-BR.json` - Portuguese stories
- Runtime loading based on player's locale preference

### Game State Storage: In-Memory

**Decision**: Store active game rooms in server memory.

**Rationale**:
- Game sessions are short (5-10 minutes)
- No persistence needed between server restarts
- Simpler than Redis for this scale
- Can add Redis later if scaling requires

**Limitations**:
- Lost on server restart (acceptable for MVP)
- Single server limitation (acceptable for initial scale)

## Best Practices Research

### Socket.IO with Next.js App Router

**Pattern**: Custom server (required for persistent WebSocket connections).

**Approach**: Create a `server.ts` file at project root to share HTTP server with Next.js.

**Implementation**:

```javascript
// server.ts (project root)
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    // Game event handlers here
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

**Package.json scripts update**:
```json
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "start": "NODE_ENV=production node server.ts"
  }
}
```

**Client setup** (with `"use client"` for SSR exclusion):
```typescript
// apps/web/src/lib/socket.ts
"use client";
import { io } from "socket.io-client";
export const socket = io();
```

**Key Considerations**:
- Custom server required (not deployable to Vercel)
- Handle CORS for development
- Implement room-based broadcasting for game isolation
- Type-safe events using shared types from packages/game

**Reference**: https://socket.io/pt-br/how-to/use-with-nextjs

### Game State Machine

**Pattern**: Finite state machine for game phases.

**States**:
1. `waiting` - Lobby, waiting for players
2. `playing` - Active round in progress
   - `question` - Players asking questions
   - `vote` - Voting phase
   - `reveal` - Showing results
3. `ended` - Game finished

**Transitions**:
- `waiting` → `playing` (host starts game)
- `playing.question` → `playing.vote` (timer or all questions done)
- `playing.vote` → `playing.reveal` (voting complete)
- `playing.reveal` → `waiting` (play again) or `ended` (players leave)

### Mobile-First Design

**Approach**: Tailwind CSS responsive design with mobile breakpoints first.

**Key Considerations**:
- Touch-friendly buttons (min 44px tap target)
- Readable text at small screens
- Portrait orientation primary
- Bottom navigation/actions for thumb reach
- Minimal UI per spec requirement

## Security Considerations

### Input Validation
- Validate all Socket.IO event payloads with Zod
- Sanitize player names (length, characters)
- Validate room codes (format, existence)

### Room Access
- Unique room codes prevent guessing
- No authentication required (simpler UX)
- Rate limiting on room creation (prevent abuse)

## Performance Considerations

### Latency
- Target: <500ms for all interactions
- Socket.IO provides real-time updates
- Minimal payload sizes for events
- Debounce rapid updates if needed

### Scalability (Future)
- Current: Single server, in-memory state
- Future: Redis for state sharing, horizontal scaling
- Socket.IO adapter for multi-server support
