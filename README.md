# WhoIsJudas

A real-time multiplayer social deduction game built with Next.js and Socket.IO. Players join rooms, receive roles, and must identify the traitor among them.

## Features

- **Real-time Multiplayer** - Socket.IO powered instant communication
- **Role-based Gameplay** - Unique abilities for each player role
- **Multi-tab Support** - Play from multiple browser tabs without conflicts
- **Session Persistence** - Reconnect seamlessly after connection drops
- **TypeScript** - Full type safety across client and server
- **Shared UI Components** - shadcn/ui primitives in a centralized package

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Real-time**: Socket.IO 4.x
- **Styling**: TailwindCSS + shadcn/ui
- **API**: ORPC (end-to-end type-safe APIs)
- **State Management**: TanStack Query
- **Internationalization**: next-intl
- **Database**: PostgreSQL with Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your database connection string

# Push schema to database
pnpm run db:push
```

### Development

```bash
# Start all applications in development mode
pnpm run dev

# Start only the web application
pnpm run dev:web
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
whoisjudas/
├── apps/
│   └── web/                 # Fullstack Next.js application
│       ├── server.ts        # Socket.IO server
│       └── src/             # Next.js app router
├── packages/
│   ├── ui/                  # Shared shadcn/ui components
│   ├── game/                # Game logic and state
│   ├── data/                # Database schema & queries
│   ├── api/                 # API layer
│   ├── env/                 # Environment configuration
│   └── config/              # Shared configs
└── specs/                   # Feature specifications
```

## Game Rules

Players are divided into two teams: **Villagers** and **Judas** (the traitor). The villagers must identify the Judas before time runs out, while the Judas must evade detection.

### Win Conditions

- **Villagers Win**: Identify and vote out the Judas
- **Judas Wins**: Survive until the end or blend in during final vote

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all applications in development mode |
| `pnpm run build` | Build all applications |
| `pnpm run dev:web` | Start only the web application |
| `pnpm run check-types` | Check TypeScript types across all apps |
| `pnpm run db:push` | Push schema changes to database |
| `pnpm run db:generate` | Generate database client/types |
| `pnpm run db:migrate` | Run database migrations |
| `pnpm run db:studio` | Open database studio UI |
| `pnpm run check` | Run Biome formatting and linting |
| `cd apps/web && pnpm run generate-pwa-assets` | Generate PWA assets |

## UI Customization

### Design Tokens

Change global styles and design tokens in:

```bash
packages/ui/src/styles/globals.css
```

### Adding Components

Add shared primitives to the UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components:

```tsx
import { Button } from "@whoisjudas/ui/components/button";
```

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `{ roomId, playerName }` | Join a game room |
| `room:reconnect` | `{ roomId, playerId }` | Reconnect to existing session |
| `room:ready` | `{}` | Player is ready to start |
| `room:vote` | `{ targetId }` | Vote for a player |
| `room:ability` | `{ targetId }` | Use role ability |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room:state` | `GameState` | Full game state update |
| `room:player-joined` | `Player` | New player joined |
| `room:player-left` | `{ playerId }` | Player left/disconnected |
| `room:kicked` | `{ reason }` | Kicked from room |
| `room:error` | `{ message }` | Error occurred |

## License

Private project - all rights reserved
