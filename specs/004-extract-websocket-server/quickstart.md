# Quickstart: WhoIsJudas WebSocket Server

## Prerequisites

- Node.js 18+
- pnpm 8+

## Setup

```bash
cd server
pnpm install
```

## Development

```bash
pnpm dev        # Start development server on port 3001
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

## Production

```bash
pnpm build
pnpm start
```

## Client Connection

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  auth: {
    browserSessionId: getBrowserSessionId()
  }
});
```

See `/contracts/` for full event documentation.
