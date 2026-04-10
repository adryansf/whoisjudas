# Data Model: Who Is Judas? - Social Deduction Game

**Feature**: 001-social-deduction-game
**Date**: 2026-03-14

## Overview

This document defines the data structures for the social deduction game. All game data (stories, characters) is stored in local JSON files. Game state is stored in-memory on the server.

## Static Data (JSON Files)

### Biblical Story

Represents a themed scenario for a game round.

```typescript
interface BiblicalStory {
  id: string;                    // Unique identifier (e.g., "noahs-ark")
  title: string;                 // Display title (e.g., "Noah's Ark")
  description: string;           // Story context for players
  characters: CharacterRole[];   // Available roles in this story (min 12)
}
```

### Character Role

Represents a persona that players can be assigned.

```typescript
interface CharacterRole {
  id: string;                    // Unique within story
  name: string;                  // Display name
  description?: string;          // Optional flavor text
}
```

### Story File Structure

```json
// packages/data/src/stories/en.json
{
  "stories": [
    {
      "id": "noahs-ark",
      "title": "Noah's Ark",
      "description": "The great flood is coming. Animals are boarding the ark two by two.",
      "characters": [
        { "id": "noah", "name": "Noah" },
        { "id": "son1", "name": "One of Noah's Sons" }
        // ... minimum 12 characters per story
      ]
    }
  ]
}
```

**Requirement**: Each story MUST have at least 12 unique character roles to support maximum player count.

### Data Loading

```typescript
// packages/data/src/loader.ts
import { nanoid } from 'nanoid';
import enStories from './stories/en.json';
import ptBRStories from './stories/pt-BR.json';

const storiesByLocale = {
  en: enStories.stories,
  'pt-BR': ptBRStories.stories
};

export function loadStories(locale: 'en' | 'pt-BR'): BiblicalStory[] {
  return storiesByLocale[locale] || storiesByLocale.en;
}

export function getStoryById(storyId: string, locale: string): BiblicalStory | undefined {
  const stories = loadStories(locale as 'en' | 'pt-BR');
  return stories.find(s => s.id === storyId);
}

export function getRandomStory(locale: string, playerCount: number): BiblicalStory {
  const stories = loadStories(locale as 'en' | 'pt-BR');
  // Filter stories with enough characters
  const validStories = stories.filter(s => s.characters.length >= playerCount);
  if (validStories.length === 0) {
    throw new Error(`No stories available for ${playerCount} players`);
  }
  return validStories[Math.floor(Math.random() * validStories.length)];
}
```

## Runtime Data (In-Memory)

### Game Room

Represents a game session with players.

```typescript
type RoomState = 'waiting' | 'playing' | 'ended';
type GamePhase = 'question' | 'vote' | 'reveal';

interface GameRoom {
  code: string;                  // 8 character nanoid
  hostId: string;                // Player ID of room creator
  state: RoomState;              // Current room state
  players: Map<string, Player>;  // Player ID → Player
  currentRound: Round | null;    // Active round if playing
  createdAt: Date;
  lastActivityAt: Date;          // Updated on each player action
}
```

### Player

Represents a participant in a game room.

```typescript
type PlayerRole = 'disciple' | 'judas';

interface Player {
  id: string;                    // Generated on join
  name: string;                  // Display name chosen by player
  role?: PlayerRole;             // Assigned when round starts
  character?: CharacterRole;     // Assigned when round starts
  vote?: string;                 // Player ID voted for (during vote phase)
  judasGuess?: string;           // Story ID guessed (Judas only)
  isConnected: boolean;
  socketId?: string;             // Current socket connection ID
  locale: 'en' | 'pt-BR';        // Player's language preference
  joinedAt: Date;
}
```

### Round

Represents a single game instance.

```typescript
type RoundOutcome = 'disciples-win' | 'judas-win' | 'tie' | null;

interface Round {
  storyId: string;               // Selected story ID
  phase: GamePhase;              // Current phase
  phaseStartedAt: Date;          // When current phase began
  timerSeconds: number;          // Duration for current phase
  judasId: string;               // ID of player assigned Judas role
  outcome: RoundOutcome;         // Result after reveal
  votes: Map<string, string>;    // voterId → targetId
}
```

### Room Store (Global)

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

export function getRoom(code: string): GameRoom | undefined {
  return rooms.get(code.toUpperCase());
}

export function setRoom(code: string, room: GameRoom): void {
  rooms.set(code.toUpperCase(), room);
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase());
}

export function getAllRooms(): Map<string, GameRoom> {
  return rooms;
}
```

### Room Cleanup (Automatic)

```typescript
// packages/game/src/cleanup.ts
const INACTIVE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

export function cleanupInactiveRooms(): number {
  const now = new Date();
  let removed = 0;
  
  for (const [code, room] of getAllRooms()) {
    const inactiveTime = now.getTime() - room.lastActivityAt.getTime();
    if (inactiveTime > INACTIVE_THRESHOLD_MS) {
      deleteRoom(code);
      removed++;
    }
  }
  
  return removed;
}

// Run cleanup every 10 minutes
setInterval(cleanupInactiveRooms, 10 * 60 * 1000);
```

## State Transitions

### Room State Machine

```
[waiting] ──start game──> [playing] ──all leave──> [ended]
    ↑                          │
    └────play again────────────┘
```

### Round Phase Machine

```
[question] ──timer ends──> [vote] ──voting done──> [reveal] ──acknowledge──> (back to waiting or end)
```

**Important**: Server is the absolute authority on timer. Clients must ignore local actions after receiving `game:phase-change`.

## Win Conditions

### Disciples Win
- Majority of votes correctly identify Judas

### Judas Wins
- Players fail to identify Judas (no majority or wrong player)
- AND Judas correctly guesses the story

### Tie
- Players fail to identify Judas
- AND Judas fails to guess the story (wrong or no guess)

### Determination Logic

```typescript
function determineWinner(room: GameRoom): RoundOutcome {
  const round = room.currentRound;
  if (!round) return null;
  
  // Count votes
  const voteCounts = new Map<string, number>();
  for (const targetId of round.votes.values()) {
    voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
  }
  
  // Check if Judas was identified (majority)
  const judasVoteCount = voteCounts.get(round.judasId) || 0;
  const totalVotes = round.votes.size;
  const judasIdentified = judasVoteCount > totalVotes / 2;
  
  if (judasIdentified) {
    return 'disciples-win';
  }
  
  // Judas was not identified - check if Judas guessed correctly
  const judas = room.players.get(round.judasId);
  const judasGuessedCorrectly = judas?.judasGuess === round.storyId;
  
  if (judasGuessedCorrectly) {
    return 'judas-win';
  }
  
  return 'tie';
}
```

## Validation Rules

### Player Name
- Required, non-empty
- Length: 2-20 characters
- Alphanumeric, spaces, and basic punctuation allowed
- Unique within room

### Room Code
- Generated automatically using nanoid (8 characters)
- Uppercase letters and numbers
- Collision check on creation
- Case-insensitive lookup

### Vote
- Must be a valid player ID in the same room
- Cannot vote for self
- One vote per round

### Judas Guess
- Must be a valid story ID from `possibleStories` list
- One guess per round
- Wrong guess results in no penalty (but may lead to tie)

## Data Access Patterns

### Creating a Room
1. Generate unique room code with `createRoomCode()`
2. Create room with host as first player
3. Store in rooms map
4. Set `lastActivityAt` to now

### Joining a Room
1. Validate room code exists (case-insensitive)
2. Validate room not full (max 12)
3. Validate unique player name
4. Add player to room
5. Update `lastActivityAt`

### Starting a Round
1. Validate minimum players (3)
2. Get random story for host's locale
3. Assign random Judas
4. Assign characters to all players
5. Transition to playing state

### Processing Vote
1. Validate player hasn't voted
2. Record vote in round's votes map
3. Check if all votes in
4. If complete, move to reveal phase

### Player Reconnection
1. Player reconnects with socket
2. Find room by playerId (stored in socket session or query)
3. Update player's `socketId` and `isConnected`
4. Send full game state to reconnecting player:
   - Current phase
   - Remaining time (calculated from server)
   - Player's role and character
   - Other players' names (not their roles)

## Example Data Files

### English Stories (en.json)

See implementation in `packages/data/src/stories/en.json`.

### Portuguese Stories (pt-BR.json)

See implementation in `packages/data/src/stories/pt-BR.json`.

Both files contain the same stories with translated content.

**Requirement**: Each story must have minimum 12 character roles.
