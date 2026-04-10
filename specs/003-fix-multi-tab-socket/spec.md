# Feature Specification: Fix Multi-Tab Socket Connection Bug

**Feature Branch**: `003-fix-multi-tab-socket`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: Fix multi-tab socket connection bug. When user copies room link and opens in another browser tab, the original tab loses connection and cannot reconnect normally. Root cause: playerId is stored in localStorage and shared between tabs, causing socket conflict when same playerId reconnects from another tab. Solution: Use sessionStorage instead of localStorage so each tab has its own session, or add unique tabId per session.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Independent Tab Sessions (Priority: P1)

As a player, when I open a room link in multiple browser tabs, each tab should function as an independent session without interfering with other tabs.

**Why this priority**: This is a critical bug that prevents正常使用 of the application when users share links.

**Independent Test**: Open a room link in Tab A, join the game, then open the same link in Tab B, join as a different player. Verify Tab A continues to work normally without disconnecting.

**Acceptance Scenarios**:

1. **Given** I am playing in a room in Tab A, **When** I open the same room link in Tab B, **Then** Tab A should NOT lose connection and should continue to function normally
2. **Given** I am playing in a room in Tab A, **When** I open the same room link in Tab B and join the game, **Then** Tab B should function as a separate independent session
3. **Given** I close Tab B, **When** I return to Tab A, **Then** Tab A should still be connected and functional

---

### User Story 2 - Seamless Reconnection (Priority: P2)

As a player, if my connection drops, I should be able to reconnect without losing my place in the game, as long as the game hasn't progressed without me.

**Why this priority**: Network issues happen; users should be able to recover gracefully.

**Independent Test**: Simulate a connection drop and verify reconnection works within the allowed window.

**Acceptance Scenarios**:

1. **Given** I am connected to a room, **When** my connection drops temporarily, **Then** I should automatically reconnect and resume my session within 30 seconds
2. **Given** I am reconnecting after a connection drop, **When** the game has progressed without me (player was removed), **Then** I should see an appropriate error message and be able to rejoin as a new player

---

### User Story 3 - Session Persistence (Priority: P3)

As a player, when I refresh the same browser tab, my session should be preserved and I should rejoin the game automatically.

**Why this priority**: Users refresh pages accidentally; sessions should survive.

**Independent Test**: Refresh the browser tab and verify automatic rejoin.

**Acceptance Scenarios**:

1. **Given** I am playing in a room, **When** I refresh the browser tab, **Then** I should automatically reconnect and see the current game state
2. **Given** I refresh and reconnect, **When** the game has moved to a phase I missed, **Then** I should see the current phase and be able to continue playing

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each browser tab MUST have its own independent session when connecting to the same room
- **FR-002**: Using `sessionStorage` instead of `localStorage` for session data to prevent cross-tab interference
- **FR-003**: The backend MUST handle multiple connections from the same playerId from different tabs as separate sessions
- **FR-004**: When a tab closes, it MUST properly clean up its session without affecting other tabs
- **FR-005**: Players MUST be able to reconnect within 30 seconds and resume their session
- **FR-006**: The reconnect logic MUST validate that the player's session still exists on the server before allowing reconnection

### Key Entities

- **Player Session**: Represents a player's connection to a room, identified by playerId + tabId
- **Room State**: Server-side state that tracks all connected players and their sessions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Opening the same room link in 2 browser tabs results in 2 independent, functional sessions (verified by manual testing)
- **SC-002**: Original tab maintains connection when new tab connects (no unexpected disconnects)
- **SC-003**: Session survives page refresh in the same tab
- **SC-004**: Temporary connection loss followed by reconnection within 30 seconds restores the session

## Assumptions

- Socket.IO connection can be uniquely identified by a combination of playerId and tabId
- Server-side session timeout is set appropriately (default 30 seconds)
- Multiple tabs of the same browser share sessionStorage but not localStorage behavior