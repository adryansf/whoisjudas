# Tasks: Fix Multi-Tab Socket Connection Bug

**Input**: Design documents from `/specs/003-fix-multi-tab-socket/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual multi-tab testing (no automated tests needed for this bug fix)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup required - modifying existing component only

*This phase is N/A for this feature - single file change*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify current behavior and understand the code structure

- [x] T001 Read and understand `apps/web/server.ts` room:reconnect handler (lines 472-525)
- [x] T002 [P] Verify current kick behavior in connection handler (lines 255-266) - confirm it should remain

**Checkpoint**: Code structure understood - ready for implementation

---

## Phase 3: User Story 1 - Independent Tab Sessions (Priority: P1) 🎯 MVP

**Goal**: Remove the kick behavior from reconnect handler so multiple tabs can coexist

**Independent Test**: Open same room in 2 browser tabs - both should work without kicking

### Implementation for User Story 1

- [x] T003 [US1] Remove kick block from room:reconnect handler in `apps/web/server.ts` (lines 489-501)
  - Remove the `if (existingSocketId && existingSocketId !== socket.id)` block that kicks existing socket
  - Keep only `playerSockets.set(playerId, socket.id);`
- [x] T004 [US1] Verify disconnect handler cleanup (lines 766-813) - ensure it doesn't break after fix
- [x] T005 [US1] Verify connection-time kick (lines 255-266) remains unchanged - prevents same-tab duplicates

**Checkpoint**: Reconnect fix applied - multiple tabs can coexist

---

## Phase 4: User Story 2 - Seamless Reconnection (Priority: P2)

**Goal**: Verify reconnection still works for legitimate single-tab disconnects

**Independent Test**: Simulate network disconnect and verify auto-reconnect works

### Implementation for User Story 2

- [x] T006 [US2] Test reconnect in same tab (Tab A loses connection, reconnects within 30 seconds)
- [x] T007 [US2] Verify session persistence after temporary disconnect

**Checkpoint**: Single-tab reconnection still works correctly

---

## Phase 5: User Story 3 - Session Persistence (Priority: P3)

**Goal**: Verify page refresh preserves session

**Independent Test**: Refresh browser tab and verify automatic rejoin

### Implementation for User Story 3

- [x] T008 [US3] Test page refresh in same tab - session should persist via playerId in localStorage

**Checkpoint**: Page refresh preserves session

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A - no setup required
- **Foundational (Phase 2)**: No dependencies - understand code first
- **User Story 1 (Phase 3)**: Core fix - must complete first
- **User Story 2 (Phase 4)**: Verifies fix doesn't break reconnection
- **User Story 3 (Phase 5)**: Verifies session persistence still works

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after code understanding - this IS the fix
- **User Story 2 (P2)**: Depends on US1 completion - verifies reconnection still works
- **User Story 3 (P3)**: Depends on US1 completion - verifies refresh still works

### Within Each User Story

- Component updates marked [P] can run in parallel (different components)
- Sequential tasks must run in order

### Parallel Opportunities

- T002 and T001 can run in parallel (reading different sections)
- T004 and T005 can run in parallel (verify different handlers)

---

## Parallel Example: Complete Fix

```bash
# Read code sections in parallel:
Task: "Read room:reconnect handler"
Task: "Read connection handler"

# Then apply fix:
Task: "Remove kick block from reconnect handler"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Code understanding
2. Complete Phase 3: US1 implementation (the fix)
3. **STOP and VALIDATE**: Test multi-tab scenario
4. Deploy if fix works

### Incremental Delivery

1. Complete code understanding
2. Implement US1 fix
3. Test multi-tab scenario
4. Add US2 verification (reconnection still works)
5. Add US3 verification (refresh still works)

---

## Notes

- [P] tasks = different files/sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Manual testing required - no automated tests for this UI/socket bug fix
- The fix is removing ~10 lines of code (the kick block)