# Socket.IO Event Contracts

## Connection

### Client → Server Events

#### `room:create`
Creates a new game room.

**Payload:**
```typescript
{
  hostName: string; // 1-20 chars
}
```

**Response:**
```typescript
{
  success: boolean;
  roomCode?: string;
  playerId?: string;
  hostId?: string;
  error?: string;
}
```

#### `room:join`
Joins an existing room.

**Payload:**
```typescript
{
  roomCode: string; // 1-10 chars, case-insensitive
  playerName: string; // 1-20 chars
}
```

**Response:**
```typescript
{
  success: boolean;
  playerId?: string;
  players?: Array<{ id: string; name: string; isConnected: boolean }>;
  hostId?: string;
  error?: string;
}
```

#### `room:reconnect`
Reconnects to an existing game.

**Payload:**
```typescript
{
  roomCode: string;
  playerId: string; // nanoid format
}
```

**Response:**
```typescript
{
  success: boolean;
  gameState?: unknown;
  error?: string;
}
```

#### `room:leave`
Leaves the current room voluntarily.

**Payload:** None

**Response:** Broadcasts `room:player-left` to room

#### `room:update-settings`
Host updates game settings.

**Payload:**
```typescript
{
  roomCode: string;
  settings: {
    questionDuration: number; // 60-1800 seconds
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `game:start`
Host starts the game.

**Payload:** None

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Side effect:** Broadcasts `game:started` to all players in room

#### `vote:cast`
Player casts vote for who they think Judas is.

**Payload:**
```typescript
{
  targetId: string; // nanoid format
}
```

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Side effect:** Broadcasts `vote:update` with vote counts

#### `judas:guess`
Judas guesses which story is the real one.

**Payload:**
```typescript
{
  storyId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  correct?: boolean;
  error?: string;
}
```

**Side effect:** May trigger reveal if all votes in

#### `game:play-again`
Host restarts the game for another round.

**Payload:** None

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

---

### Server → Client Events

#### `kicked`
Emitted when player is disconnected due to duplicate connection.

```typescript
{
  reason: string;
}
```

#### `room:player-joined`
Broadcast when a new player joins.

```typescript
{
  player: { id: string; name: string; isConnected: boolean };
  playerCount: number;
}
```

#### `room:player-left`
Broadcast when a player leaves or disconnects.

```typescript
{
  playerId: string;
  playerName?: string;
  playerCount: number;
}
```

#### `room:host-changed`
Broadcast when host leaves and new host is assigned.

```typescript
{
  newHostId: string;
  newHostName: string;
}
```

#### `player:updated`
Broadcast when player information is updated.

```typescript
{
  player: { id: string; name: string; isConnected: boolean };
}
```

#### `room:settings-updated`
Broadcast when host updates settings.

```typescript
{
  settings: { questionDuration: number };
}
```

#### `game:started`
Personalized game state sent to each player when game starts.

```typescript
{
  // Varies by player role - see @whoisjudas/game for details
}
```

#### `game:timer`
Broadcast every second during active game phases.

```typescript
{
  timerRemaining: number;
  phase: "question" | "vote" | "reveal";
}
```

#### `game:phase-change`
Broadcast when phase transitions.

```typescript
{
  phase: "vote";
  timerSeconds: number;
}
```

#### `vote:update`
Broadcast when vote is cast.

```typescript
{
  votesCounted: number;
  totalVoters: number;
}
```

#### `game:reveal`
Broadcast when round ends and Judas is revealed.

```typescript
{
  judasId: string;
  judasName: string;
  storyId: string;
  winner: "judas" | "disciples" | "tie";
  votes: Array<{
    voterId: string;
    voterName: string;
    targetId: string;
  }>;
  judasGuess?: string;
}
```

#### `room:rejoin`
Broadcast when host restarts game (play again).

```typescript
// No payload - players should return to lobby state
```
