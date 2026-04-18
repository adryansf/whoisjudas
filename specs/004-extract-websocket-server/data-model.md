# Data Model: WebSocket Server

## Entities

### PlayerInfo
Represents a player connected via Socket.IO.

| Field | Type | Description |
|-------|------|-------------|
| playerId | string | Unique player identifier (nanoid format) |
| roomCode | string | Current room the player is in |
| browserSessionId | string (optional) | Browser session for multi-tab support |

### Room (managed by @whoisjudas/game)
Game room managed externally - server only tracks socket associations.

| Field | Type | Description |
|-------|------|-------------|
| roomCode | string | Unique room identifier |
| hostId | string | Player ID of the room host |
| players | Map | Player instances |
| state | "waiting" \| "playing" \| "ended" | Current game state |
| currentRound | Round (optional) | Active round if game in progress |

### Round (managed by @whoisjudas/game)
Current game round with timer and voting state.

| Field | Type | Description |
|-------|------|-------------|
| phase | "question" \| "vote" \| "reveal" | Current phase |
| timerRemaining | number | Seconds until phase ends |
| judasId | string | Player ID of Judas |
| storyId | string | Selected story for this round |
| votes | Map | voterId → targetId mappings |
| judasGuess | string (optional) | Judas's story guess |

### SocketState
In-memory tracking of socket ↔ player relationships.

| Field | Type | Description |
|-------|------|-------------|
| playerSockets | Map<string, string[]> | playerId → socketIds[] |
| socketPlayers | Map<string, PlayerInfo> | socketId → PlayerInfo |
| browserSessionPlayers | Map<string, {playerId, roomCode}[]> | browserSessionId → player/room list |

## State Transitions

### Connection Lifecycle
```
Disconnected → Connected → Authenticated → InRoom → Playing → Disconnected
```

### Game Lifecycle (managed by @whoisjudas/game)
```
Waiting → Playing (question) → Playing (vote) → Reveal → Waiting (play again)
```

## Validation Rules

- **roomCode**: 1-10 alphanumeric characters, uppercase
- **playerName**: 1-20 characters, trimmed
- **playerId**: nanoid format (12 chars, A-Za-z0-9_-)
- **storyId**: non-empty string
- **targetId**: nanoid format for vote targets
