# Quickstart: Who Is Judas? - Social Deduction Game

**Feature**: 001-social-deduction-game
**Date**: 2026-03-14

## Prerequisites

- Node.js 18+
- pnpm 10+
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Setup

```bash
# Install dependencies
pnpm install

# Start development server (custom server with Socket.IO)
pnpm run dev
```

Open http://localhost:3001 in your browser.

## Development Workflow

### Running the Application

```bash
# Start all packages in dev mode
pnpm run dev

# Start only the web app (without Socket.IO - for UI work)
pnpm run dev:web

# Type checking
pnpm run check-types

# Linting and formatting
pnpm run check
```

### Project Structure

```
apps/web/           # Next.js application
  src/app/          # App Router pages
  src/components/   # React components
  src/hooks/        # Custom hooks
  src/i18n/         # Internationalization
  src/lib/          # Socket.IO client setup

packages/game/      # Game logic and types
packages/data/      # Biblical stories (JSON)
packages/ui/        # Shared UI components

server.ts           # Custom server for Socket.IO
```

## Key Implementation Points

### 1. Socket.IO Setup (Custom Server)

Socket.IO requires a custom server for persistent WebSocket connections. Create `server.ts` at project root:

```javascript
// server.ts
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
    // Import game handlers from packages/game
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

**Client setup** (with `"use client"` for SSR exclusion):
```typescript
// apps/web/src/lib/socket.ts
"use client";
import { io } from "socket.io-client";
export const socket = io();
```

**Reference**: https://socket.io/pt-br/how-to/use-with-nextjs

### 2. Internationalization

Route structure with locale:

```
app/[locale]/page.tsx
app/[locale]/lobby/[code]/page.tsx
app/[locale]/game/[code]/page.tsx
```

Access translations in components:

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('game');
  return <h1>{t('title')}</h1>;
}
```

Each player sees content in their own locale (set on join).

### 3. Game State Management

Game rooms are managed in-memory:

```typescript
// packages/game/src/store.ts
import { nanoid } from 'nanoid';

const rooms = new Map<string, GameRoom>();

export function createRoomCode(): string {
  let code: string;
  do {
    code = nanoid(8).toUpperCase();
  } while (rooms.has(code));
  return code;
}
```

### 4. Mobile-First Styling

Use Tailwind's responsive utilities:

```tsx
// Mobile-first, then tablet/desktop
<div className="p-4 md:p-6 lg:p-8">
  <button className="w-full md:w-auto">
    Start Game
  </button>
</div>
```

## Testing the Game

### Manual Testing Flow

1. **Create Room**: Open app, enter name, select language, click "Create Game"
2. **Join Room**: Open another browser/incognito, enter same room code
3. **Start Game**: As host, click "Start Game" (need 3+ players)
4. **Question Phase**: Ask questions in real life (no in-game chat)
5. **Vote Phase**: Vote for who you think is Judas
6. **Reveal**: See who was Judas and what the story was

### Simulating Multiple Players

Open multiple browser tabs or use incognito windows to simulate multiple players joining the same room.

## Common Tasks

### Adding a New Biblical Story

1. Edit `packages/data/src/stories/en.json`
2. Add the same story to `pt-BR.json` with translations
3. **Required**: Minimum 12 character roles per story

```json
{
  "id": "david-goliath",
  "title": "David and Goliath",
  "description": "The Israelites face the Philistines in the Valley of Elah.",
  "characters": [
    { "id": "david", "name": "David" },
    { "id": "saul", "name": "King Saul" },
    { "id": "goliath", "name": "Goliath" },
    { "id": "jonathan", "name": "Jonathan" },
    { "id": "soldier1", "name": "An Israelite Soldier" },
    { "id": "soldier2", "name": "Another Israelite Soldier" },
    { "id": "shepherd1", "name": "A Shepherd" },
    { "id": "brother1", "name": "One of David's Brothers" },
    { "id": "brother2", "name": "Another of David's Brothers" },
    { "id": "messenger", "name": "A Messenger" },
    { "id": "philistine", "name": "A Philistine Warrior" },
    { "id": "servant", "name": "A Servant" }
  ]
}
```

### Adding a New UI Component

1. Create component in `apps/web/src/components/`
2. Use shadcn/ui primitives from `@whoisjudas/ui/components/*`
3. Ensure mobile-responsive design

### Adding New Translations

1. Create/update locale files in `apps/web/src/i18n/messages/`
2. Add keys to both `en.json` and `pt-BR.json`

## Deployment

```bash
# Build for production
pnpm run build

# Start production server (custom server with Socket.IO)
pnpm run start
```

**Note**: Cannot deploy to Vercel (requires custom server for WebSocket). Use VPS, Railway, Fly.io, or similar.

### Environment Variables

Required for production:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Troubleshooting

### WebSocket Connection Issues

- Ensure running via `server.ts`, not `next dev`
- Check CORS settings in Socket.IO server
- Ensure firewall allows WebSocket connections
- Check browser console for connection errors

### Missing Translations

- Verify both `en.json` and `pt-BR.json` have the same keys
- Check namespace in `useTranslations()` call

### Game State Not Syncing

- Check Socket.IO event handlers in both server and client
- Verify room code is correct on both sides
- Check server logs for errors

### Player Reconnection

- Players can reconnect within 2 hours of last activity
- Game state is preserved during disconnect
- Timer continues running regardless of player connection
