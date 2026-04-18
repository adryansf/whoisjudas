# Tasks: Extrair WebSocket Server do Next.js

**Input**: Design documents from `/specs/004-extract-websocket-server/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create standalone Node.js server project structure

- [X] T001 Create server/ directory structure per plan.md
- [X] T002 Create server/package.json with pnpm, TypeScript 5.x, @socket.io/server, @whoisjudas/game
- [X] T003 Create server/tsconfig.json for TypeScript configuration
- [X] T004 [P] Create server/.gitignore (node_modules/, dist/, *.log)
- [X] T005 [P] Create server/README.md with project overview

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Core server setup required before any user story

**⚠️ CRITICAL**: No user story work until this phase is complete

- [X] T006 Create server/src/index.ts - HTTP server with Socket.IO setup, graceful shutdown
- [X] T007 Create server/src/types.ts - TypeScript types (PlayerInfo, SocketState, etc.)
- [X] T008 Create server/src/lib/rate-limit.ts - Sliding window rate limiter (5s window, 20 max)
- [X] T009 Create server/src/socket/rooms.ts - Room management (playerSockets, socketPlayers maps)
- [X] T010 Setup socket.io connection handler skeleton in server/src/socket/handler.ts
- [X] T011 Add environment configuration (PORT default 3001, CORS_ORIGIN)
- [X] T012 Verify server starts and creates HTTP server without errors

**Checkpoint**: Foundation ready - server can start, rate limiting works, socket state tracked

---

## Phase 3: User Story 1 - Extrair lógica WebSocket para projeto standalone (Priority: P1) 🎯 MVP

**Goal**: Standalone server initiates independently, handles room events, manages game timers

**Independent Test**: Server starts without Next.js, processes room:create/room:join/room:leave, game timers fire correctly

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement room:create handler in server/src/socket/handler.ts
- [X] T014 [P] [US1] Implement room:join handler in server/src/socket/handler.ts
- [X] T015 [P] [US1] Implement room:leave handler in server/src/socket/handler.ts
- [X] T016 [US1] Wire room handlers to Socket.IO events (room:create, room:join, room:leave)
- [X] T017 [US1] Integrate @whoisjudas/game for room creation/joining logic
- [X] T018 [US1] Implement game:start handler triggering @whoisjudas/game
- [X] T019 [US1] Add game timer broadcast (game:timer, game:phase-change events)
- [ ] T020 [US1] Verify room events work: room:create returns roomCode/playerId
- [ ] T021 [US1] Test server startup < 5 seconds, memory < 100MB with 50 rooms

**Checkpoint**: User Story 1 functional - server is standalone, room events work, game timers broadcast

---

## Phase 4: User Story 2 - Manter compatibilidade com cliente existente (Priority: P2)

**Goal**: Existing frontend connects to standalone server without changes (except URL)

**Independent Test**: Existing Socket.IO client connects, creates rooms, casts votes, game plays to completion

### Implementation for User Story 2

- [ ] T022 [P] [US2] Implement game:start handler in server/src/socket/handler.ts
- [ ] T023 [P] [US2] Implement vote:cast handler in server/src/socket/handler.ts
- [ ] T024 [P] [US2] Implement judas:guess handler in server/src/socket/handler.ts
- [ ] T025 [US1] Wire game handlers to Socket.IO events (game:start, vote:cast, judas:guess)
- [ ] T026 [US2] Broadcast game:started, vote:update, game:reveal events per contracts/events.md
- [ ] T027 [US2] Test vote:cast receives confirmation and broadcasts vote:update
- [ ] T028 [US2] Verify 100% event API compatibility with existing client
- [ ] T029 [US2] Test reconnection < 3 seconds after connection loss

**Checkpoint**: User Story 2 functional - all Socket.IO events work, client connects without changes

---

## Phase 5: User Story 3 - Suportar múltiplos rooms por sessão de browser (Priority: P3)

**Goal**: Browser can maintain multiple sockets in different rooms simultaneously

**Independent Test**: Browser session with 2 sockets in different rooms, each socket interacts independently

### Implementation for User Story 3

- [ ] T030 [P] [US3] Implement room:reconnect handler in server/src/socket/handler.ts
- [ ] T031 [P] [US3] Implement room:update-settings handler in server/src/socket/handler.ts
- [ ] T032 [P] [US3] Implement game:play-again handler in server/src/socket/handler.ts
- [ ] T033 [US3] Track browserSessionId per socket for multi-tab support
- [ ] T034 [US3] Broadcast room:player-joined, room:player-left with correct playerCount
- [ ] T035 [US3] Handle host transfer on room:host-changed when host leaves
- [ ] T036 [US3] Test 2 sockets from same browser in different rooms independently
- [ ] T037 [US3] Verify first socket not disconnected when second socket joins

**Checkpoint**: User Story 3 functional - multi-room per browser works, host transfer works

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements across all user stories

- [ ] T038 [P] Verify graceful shutdown clears all timers and disconnects sockets
- [ ] T039 [P] Add startup logging (server info, port, environment)
- [ ] T040 Add room cleanup for disconnected players
- [ ] T041 Verify SC-003: 100% Socket.IO events work after separation
- [ ] T042 Update quickstart.md with final commands
- [ ] T043 Run integration test with actual Socket.IO client

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Setup
- **Phase 3 (US1)**: Depends on Foundational
- **Phase 4 (US2)**: Depends on Foundational (can run parallel with US1 after Foundation)
- **Phase 5 (US3)**: Depends on Foundational (can run parallel with US1/US2 after Foundation)
- **Phase 6 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1**: Core server + room CRUD - foundation for US2, US3
- **US2**: Game events - depends on US1 room handling
- **US3**: Multi-room support - depends on US1 room handling

### Parallel Opportunities

- Phase 1: T001-T005 can run in parallel
- Phase 2: T006-T011 can run in parallel except T006 (index.ts depends on others being defined)
- After Phase 2: US1, US2, US3 can proceed in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test standalone server, room events, game timers
5. Deploy MVP if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test → Deploy/Demo (MVP!)
3. US2 → Test → Deploy/Demo
4. US3 → Test → Deploy/Demo
5. Polish → Final release

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 43 |
| User Story 1 Tasks | 9 |
| User Story 2 Tasks | 8 |
| User Story 3 Tasks | 8 |
| Parallelizable Tasks | ~60% |
| MVP Scope | Phase 3 (US1) only |

**Suggested Next**: Complete Phase 1 + Phase 2, then implement Phase 3 (MVP), validate, then proceed to US2/US3.
