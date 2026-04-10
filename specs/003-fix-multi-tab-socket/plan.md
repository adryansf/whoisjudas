# Implementation Plan: Fix Multi-Tab Socket Connection Bug

**Branch**: `003-fix-multi-tab-socket` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-fix-multi-tab-socket/spec.md`

## Summary

Fix the multi-tab socket connection bug where opening the same room link in another browser tab kicks the original user. Root cause: when a player reconnects (same playerId from localStorage), the server kicks the existing socket without allowing both tabs to coexist. Solution: change reconnect logic to update socket mapping without kicking existing connections.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Socket.IO, Next.js 16 (App Router)  
**Storage**: In-memory (rooms, players in `@whoisjudas/game`)  
**Testing**: Manual multi-tab testing  
**Target Platform**: Web browsers (multi-tab session handling)  
**Project Type**: Socket.IO real-time game application  
**Performance Goals**: No performance impact  
**Constraints**: 
- Fix must not break existing single-tab reconnection flow
- Keep player session persistence within a single tab
- Allow multiple browser tabs for same playerId without kicking

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Minimal changes to server.ts reconnect handler |
| II. Single Responsibility | ✅ PASS | Only changes reconnect behavior, no other side effects |
| III. Idiomatic Next.js/TypeScript | ✅ PASS | TypeScript, follows existing patterns |
| IV. Readability Over Cleverness | ✅ PASS | Clear logic: update socket mapping without kick |
| V. YAGNI | ✅ PASS | No new abstractions, just bug fix |

**GATE Result**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-multi-tab-socket/
├── plan.md              # This file
├── research.md          # N/A - root cause clearly identified
├── data-model.md        # N/A - no data model changes
├── quickstart.md        # N/A - no new interfaces
├── contracts/           # N/A - no external contracts
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/web/
└── server.ts                    # [UPDATE] - fix reconnect handler
    - Line 489-515: Change reconnect to update socket without kicking
    - Line 255-266: Review if connection-time kick is still needed
    - Line 766-813: Review disconnect handler cleanup behavior
```

**Structure Decision**: Update only `apps/web/server.ts` reconnect handler

## Phase 0: Research

### Root Cause Analysis

**Problem**: When Tab B opens with same playerId as Tab A:
1. Tab B reads `playerId` from localStorage
2. Tab B calls `room:reconnect` with same playerId
3. Server finds existing socket for playerId in `playerSockets` (line 489)
4. Server kicks Tab A's socket (line 496-499)
5. Tab A receives "kicked" event, clears localStorage, disconnects

**Current Code Flow**:
```
room:reconnect handler (line 472-525):
  - Line 489: const existingSocketId = playerSockets.get(playerId)
  - Line 490-501: If exists and different socket ID → kick existing, delete from socketPlayers
  - Line 504: Update playerSockets with new socket
```

### Solution Options

**Option 1: Remove kick from reconnect (SIMPLEST)**
- Change reconnect to update `playerSockets` without kicking
- Pro: Minimal change, fixes the bug
- Con: Multiple sockets for same playerId possible

**Option 2: Use browserSessionId for reconnect key**
- Send `browserSessionId` in reconnect payload
- Server tracks sessions, not just playerIds
- Pro: Clean separation per tab
- Con: Requires frontend change to send browserSessionId

**Option 3: Allow multiple sockets per playerId**
- Remove 1:1 playerId:socket constraint
- Broadcast to all sockets for a playerId
- Pro: Most flexible
- Con: Significant refactor

**Decision**: Option 1 - Remove kick from reconnect. This is the simplest fix that solves the reported bug while maintaining backward compatibility for legitimate reconnects (same tab, network blip).

## Phase 1: Design & Contracts

### Data Model

N/A - No data model changes. In-memory structures unchanged.

### Interface Contracts

N/A - No interface changes. Socket.IO events unchanged.

### Quickstart: Implementation Guide

```markdown
## Changes Required

### apps/web/server.ts

#### 1. room:reconnect handler (lines 489-515)

BEFORE:
```typescript
const existingSocketId = playerSockets.get(playerId);
if (existingSocketId && existingSocketId !== socket.id) {
    const existingSocket = io.sockets.sockets.get(existingSocketId);
    if (existingSocket) {
        console.log(`room:reconnect kick - Disconnecting ${existingSocketId}`);
        existingSocket.emit("kicked", { reason: "Connected from another tab" });
        existingSocket.disconnect(true);
    }
    socketPlayers.delete(existingSocketId);
}
playerSockets.set(playerId, socket.id);
```

AFTER (REMOVE THE KICK BLOCK):
```typescript
playerSockets.set(playerId, socket.id);
```

#### 2. Review connection-time kick (lines 255-266)

The connection-time kick at lines 255-266 checks if `browserSessionId` already has an active player. This should REMAIN because:
- It only fires for SAME browserSessionId (same tab reconnect)
- Prevents same tab from having duplicate sessions
- This is different from the reconnect kick we removed

#### 3. Review disconnect handler (lines 766-813)

When a player disconnects during "playing" phase, they are marked disconnected but not removed (line 796-797). This is correct - it allows reconnection without full rejoin.

The disconnect handler should NOT remove playerId from playerSockets if game is in progress - the reconnect will handle that update.

## Testing

### Manual Test Script

1. Open game in Tab A, join a room
2. Copy URL from Tab A
3. Open Tab B with same URL
4. Verify Tab A continues to work (no disconnect/kick)
5. Verify Tab B can join as same or different player
6. Close Tab B, verify Tab A still works
7. Refresh Tab A, verify reconnection works
```

## Complexity Tracking

> No violations of Constitution principles. Single file change, targeted fix.

| Change | Why Needed | Simpler Alternative Rejected Because |
|--------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

**Plan Status**: ✅ Phase 1 Complete  
**Next Step**: `/speckit.tasks` to generate implementation tasks