# WebSocket Events Contract

**Feature**: 001-social-deduction-game
**Date**: 2026-03-14

## Overview

This document defines the Socket.IO events used for real-time communication between clients and server. All events are typed using TypeScript interfaces defined in `packages/game/src/events.ts`.

**Note**: Server is the absolute authority on game state and timing. Clients must ignore local actions after receiving state change events.

## Shared Types

```typescript
interface PlayerSummary {
  id: string;
  name: string;
  isConnected: boolean;
}

interface StorySummary {
  id: string;
  title: string;
}
```

## Client → Server Events

### `room:create`

Create a new game room.

**Payload**:
```typescript
{
  hostName: string;    // 2-20 characters
  locale: 'en' | 'pt-BR';
}
```

**Response** (via callback):
```typescript
{
  success: true;
  roomCode: string;
  playerId: string;
}
// or
{
  success: false;
  error: string;
}
```

---

### `room:join`

Join an existing room.

**Payload**:
```typescript
{
  roomCode: string;    // 8 character code (case-insensitive)
  playerName: string;  // 2-20 characters, unique in room
  locale: 'en' | 'pt-BR';
}
```

**Response** (via callback):
```typescript
{
  success: true;
  playerId: string;
  players: PlayerSummary[];
  hostId: string;
}
// or
{
  success: false;
  error: string;  // "Room not found" | "Room full" | "Name taken"
}
```

---

### `room:reconnect`

Reconnect to a room after disconnect.

**Payload**:
```typescript
{
  roomCode: string;
  playerId: string;
}
```

**Response** (via callback):
```typescript
{
  success: true;
  gameState: {
    phase: 'waiting' | 'question' | 'vote' | 'reveal';
    roomState: 'waiting' | 'playing' | 'ended';
    players: PlayerSummary[];
    isHost: boolean;
    // If in game:
    role?: 'disciple' | 'judas';
    character?: { id: string; name: string };
    story?: { id: string; title: string; description: string };  // Only for disciples
    possibleStories?: StorySummary[];  // Only for Judas
    timerRemaining?: number;  // Seconds remaining
    votesCounted?: number;
    totalPlayers?: number;
  };
}
// or
{
  success: false;
  error: string;  // "Room not found" | "Player not found"
}
```

---

### `room:leave`

Leave the current room.

**Payload**: None (uses socket session)

**Response**: None (room updates broadcast to others)

---

### `game:start`

Start a new round (host only).

**Payload**: None

**Response** (via callback):
```typescript
{
  success: true;
}
// or
{
  success: false;
  error: string;  // "Not host" | "Not enough players"
}
```

---

### `vote:cast`

Cast a vote for who is Judas (Disciples only).

**Payload**:
```typescript
{
  targetId: string;  // Player ID being voted for
}
```

**Response** (via callback):
```typescript
{
  success: true;
}
// or
{
  success: false;
  error: string;  // "Invalid target" | "Already voted" | "You are Judas"
}
```

---

### `judas:guess`

Judas guesses the story.

**Payload**:
```typescript
{
  storyId: string;  // Story ID being guessed
}
```

**Response** (via callback):
```typescript
{
  success: true;
  correct: boolean;  // Whether the guess was correct (not revealed to others)
}
// or
{
  success: false;
  error: string;  // "Not Judas" | "Already guessed"
}
```

---

### `game:play-again`

Request another round with same players.

**Payload**: None

**Response** (via callback):
```typescript
{
  success: true;
}
// or
{
  success: false;
  error: string;  // "Not enough players"
}
```

---

## Server → Client Events

### `room:player-joined`

Broadcast when a player joins.

**Payload**:
```typescript
{
  player: PlayerSummary;
  playerCount: number;
}
```

---

### `room:player-left`

Broadcast when a player leaves.

**Payload**:
```typescript
{
  playerId: string;
  playerName: string;
  playerCount: number;
}
```

---

### `room:host-changed`

Broadcast when host leaves and new host assigned.

**Payload**:
```typescript
{
  newHostId: string;
  newHostName: string;
}
```

---

### `game:started`

Broadcast when a round begins. Different payloads for Judas vs Disciples.

**Payload for Disciples**:
```typescript
{
  role: 'disciple';
  character: {
    id: string;
    name: string;
  };
  story: {
    id: string;
    title: string;
    description: string;
  };
  possibleStories: StorySummary[];  // All stories for reference
  phase: 'question';
  timerSeconds: number;
  allCharacters: string[];  // List of character names in this story
}
```

**Payload for Judas**:
```typescript
{
  role: 'judas';
  character: {
    id: string;
    name: string;
  };
  story: undefined;  // Judas doesn't know the story
  possibleStories: StorySummary[];  // Stories to guess from
  phase: 'question';
  timerSeconds: number;
  allCharacters: string[];  // List of character names in this story
}
```

---

### `game:phase-change`

Broadcast when game phase changes. Server is authority—clients must respect this.

**Payload**:
```typescript
{
  phase: 'question' | 'vote' | 'reveal';
  timerSeconds: number;
}
```

---

### `vote:update`

Broadcast vote progress (without revealing who voted for whom).

**Payload**:
```typescript
{
  votesCounted: number;
  totalPlayers: number;
}
```

---

### `game:reveal`

Broadcast round results.

**Payload**:
```typescript
{
  judasId: string;
  judasName: string;
  storyId: string;
  storyTitle: string;
  winner: 'disciples' | 'judas' | 'tie';
  votes: {
    voterId: string;
    voterName: string;
    targetId: string;
    targetName: string;
  }[];
  judasGuess?: string;       // Story ID Judas guessed
  judasGuessTitle?: string;  // Story title Judas guessed
}
```

---

### `error`

Broadcast when an error occurs.

**Payload**:
```typescript
{
  message: string;
  code?: string;
}
```

---

## Event Flow Diagrams

### Create and Join Room

```
Client A                Server                  Client B
   │                      │                        │
   │──room:create───────>│                        │
   │<──room code─────────│                        │
   │                      │<─────room:join────────│
   │<──player-joined─────│                        │
   │                      │─────player-joined────>│
```

### Player Reconnection

```
Client (reconnected)     Server
        │                  │
        │──room:reconnect─>│
        │                  │ (find room by playerId)
        │<──game state─────│
        │                  │
        │                  │──player-reconnected──> (to room)
```

### Game Round

```
Host                    Server                  All Players
   │                      │                        │
   │──game:start────────>│                        │
   │                      │──game:started────────>│
   │                      │   (role-specific)      │
   │                      │                        │
   │                      │──game:phase-change───>│ (vote)
   │──vote:cast─────────>│                        │
   │                      │──vote:update─────────>│
   │                      │                        │
   │                      │──game:phase-change───>│ (reveal)
   │                      │──game:reveal─────────>│
```

### Judas Guess

```
Judas                    Server                  All Players
   │                      │                        │
   │──judas:guess───────>│                        │
   │<──correct: true─────│                        │
   │                      │──game:reveal────────>│ (immediate if correct)
   │                      │  (winner: judas)       │
```

## Type Definitions

All event types are defined in `packages/game/src/events.ts` and shared between server and client.
