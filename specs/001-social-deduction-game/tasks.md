# Tasks: Who Is Judas? - Social Deduction Game

**Input**: Design documents from `/specs/001-social-deduction-game/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/websocket-events.md

**Tests**: No tests requested in specification. Tasks focus on implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `apps/web/`, `packages/game/`, `packages/data/`
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and package structure

- [x] T001 Create `packages/data` package with package.json and tsconfig.json
- [x] T002 Create `packages/game` package with package.json and tsconfig.json
- [x] T003 [P] Add nanoid dependency to `packages/game/package.json`
- [x] T004 [P] Add socket.io dependency to `apps/web/package.json`
- [x] T005 [P] Add next-intl dependency to `apps/web/package.json`
- [x] T006 Create custom server file at `server.ts` for Socket.IO integration
- [x] T007 Update root `package.json` scripts to use custom server for dev/start
- [x] T008 [P] Create i18n routing config in `apps/web/src/i18n/routing.ts`
- [x] T009 [P] Create i18n config in `apps/web/src/i18n/config.ts`
- [x] T010 [P] Create i18n request handler in `apps/web/src/i18n/request.ts`
- [x] T011 [P] Create English translations in `apps/web/src/i18n/messages/en.json`
- [x] T012 [P] Create Portuguese translations in `apps/web/src/i18n/messages/pt-BR.json`
- [x] T013 Update `apps/web/src/app/layout.tsx` to support [locale] routing
- [x] T014 Create locale-aware layout in `apps/web/src/app/[locale]/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T015 Create game types in `packages/game/src/types.ts`
- [x] T016 Create event type definitions in `packages/game/src/events.ts`
- [x] T017 Create room store in `packages/game/src/store.ts`
- [x] T018 Create room cleanup utility in `packages/game/src/cleanup.ts`
- [x] T019 Create data loader utilities in `packages/data/src/loader.ts`
- [x] T020 Create sample English stories in `packages/data/src/stories/en.json` (min 2 stories, 12+ chars each)
- [x] T021 Create sample Portuguese stories in `packages/data/src/stories/pt-BR.json` (translated from en.json)
- [x] T022 Create package exports in `packages/data/src/index.ts`
- [x] T023 Create package exports in `packages/game/src/index.ts`
- [x] T024 Create Socket.IO client setup in `apps/web/src/lib/socket.ts`
- [x] T025 Create useSocket hook in `apps/web/src/hooks/use-socket.ts`
- [x] T026 Initialize Socket.IO server handlers in `server.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Join Game Lobby (Priority: P1) MVP

**Goal**: Players can create rooms, share codes, and join with friends

**Independent Test**: Create a room, share code, have another player join, see player list

### Implementation for User Story 1

- [x] T027 [P] [US1] Create room management functions in `packages/game/src/room.ts`
- [x] T028 [P] [US1] Implement `room:create` event handler in `server.ts`
- [x] T029 [P] [US1] Implement `room:join` event handler in `server.ts`
- [x] T030 [US1] Implement `room:leave` event handler in `server.ts`
- [x] T031 [US1] Implement `room:reconnect` event handler in `server.ts`
- [x] T032 [US1] Implement `room:player-joined` broadcast in `server.ts`
- [x] T033 [US1] Implement `room:player-left` broadcast in `server.ts`
- [x] T034 [US1] Implement `room:host-changed` broadcast in `server.ts`
- [x] T035 [P] [US1] Create home page UI in `apps/web/src/app/[locale]/page.tsx`
- [x] T036 [P] [US1] Create lobby page in `apps/web/src/app/[locale]/lobby/[code]/page.tsx`
- [x] T037 [P] [US1] Create Lobby component in `apps/web/src/components/game/lobby.tsx`
- [x] T038 [US1] Create player list component in `apps/web/src/components/game/player-list.tsx`
- [x] T039 [US1] Add start game button with player count validation
- [x] T040 [US1] Add share room code/link functionality to lobby

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Play a Complete Round (Priority: P1)

**Goal**: Players receive roles, experience question phase, vote, and see reveal

**Independent Test**: Start a game, verify roles assigned correctly, complete voting, see results

### Implementation for User Story 2

- [x] T041 [US2] Create round management functions in `packages/game/src/round.ts`
- [x] T042 [US2] Implement `game:start` event handler in `server.ts`
- [x] T043 [US2] Implement `game:started` broadcast with role-specific payloads in `server.ts`
- [x] T044 [US2] Implement `game:phase-change` broadcast in `server.ts`
- [x] T045 [US2] Implement timer logic for question phase in `server.ts`
- [x] T046 [US2] Implement `vote:cast` event handler in `server.ts`
- [x] T047 [US2] Implement `vote:update` broadcast in `server.ts`
- [x] T048 [US2] Implement `judas:guess` event handler in `server.ts`
- [x] T049 [US2] Create game page in `apps/web/src/app/[locale]/game/[code]/page.tsx`
- [x] T050 [P] [US2] Create QuestionPhase component in `apps/web/src/components/game/question-phase.tsx`
- [x] T051 [P] [US2] Create VotePhase component in `apps/web/src/components/game/vote-phase.tsx`
- [x] T052 [P] [US2] Create timer display component in `apps/web/src/components/game/timer.tsx`
- [x] T053 [US2] Create player role card component in `apps/web/src/components/game/role-card.tsx`
- [x] T054 [US2] Create story guess modal for Judas in `apps/web/src/components/game/story-guess-modal.tsx`
- [x] T055 [US2] Add phase transition handling in game page
- [x] T056 [US2] Add reconnection state sync handling in game page

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Win or Lose Determination (Priority: P2)

**Goal**: Players see clear win/lose/tie outcomes after each round

**Independent Test**: Complete a round and verify correct winner determination displayed

### Implementation for User Story 3

- [x] T057 [US3] Implement `determineWinner` function in `packages/game/src/round.ts`
- [x] T058 [US3] Implement `game:reveal` broadcast in `server.ts`
- [x] T059 [P] [US3] Create RevealPhase component in `apps/web/src/components/game/reveal-phase.tsx`
- [x] T060 [P] [US3] Create win/lose/tie result display in `apps/web/src/components/game/result-display.tsx`
- [x] T061 [US3] Create vote breakdown display in `apps/web/src/components/game/vote-breakdown.tsx`
- [x] T062 [US3] Add Judas guess reveal to result display

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Quick Game Restart (Priority: P3)

**Goal**: Players start new rounds without recreating lobby

**Independent Test**: Complete a round, tap "Play Again", verify new round starts with same players

### Implementation for User Story 4

- [x] T063 [US4] Implement `game:play-again` event handler in `server.ts`
- [x] T064 [US4] Implement round reset logic in `packages/game/src/room.ts`
- [x] T065 [US4] Add "Play Again" button to reveal phase
- [x] T066 [US4] Ensure Judas role rotates to different player on restart

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T067 [P] Add mobile-responsive styling to all game components
- [x] T068 [P] Add loading states to lobby and game pages
- [x] T069 [P] Add error handling and error display components
- [x] T070 [P] Add disconnect/reconnect UI indicators
- [x] T071 [P] Add accessibility attributes (aria-labels, focus management)
- [x] T072 Run quickstart.md validation with 3 simulated players
- [x] T073 Verify all translations present in en.json and pt-BR.json
- [x] T074 [P] Add favicon and PWA metadata for mobile install

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 and can proceed in parallel
  - US2 depends on US1 lobby being functional for testing
  - US3 depends on US2 voting being complete
  - US4 depends on US3 reveal being complete
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Benefits from US1 but independently testable
- **User Story 3 (P2)**: Depends on US2 voting and phase logic
- **User Story 4 (P3)**: Depends on US3 reveal display

### Within Each User Story

- Server handlers before client components
- Core logic before UI
- Components before pages that use them

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Within US1: T027-T029 (server) parallel with T035-T037 (client)
- Within US2: T050-T052 (components) can run in parallel
- Within US3: T059-T061 (display components) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch server-side tasks together:
Task T027: "Create room management functions in packages/game/src/room.ts"
Task T028: "Implement room:create event handler in server.ts"
Task T029: "Implement room:join event handler in server.ts"

# Launch client-side tasks together (after server tasks):
Task T035: "Create home page UI in apps/web/src/app/[locale]/page.tsx"
Task T036: "Create lobby page in apps/web/src/app/[locale]/lobby/[code]/page.tsx"
Task T037: "Create Lobby component in apps/web/src/components/game/lobby.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Lobby)
4. Complete Phase 4: User Story 2 (Gameplay)
5. **STOP and VALIDATE**: Test full game loop end-to-end
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test lobby independently → Deploy/Demo
3. Add User Story 2 → Test full round independently → Deploy/Demo (MVP!)
4. Add User Story 3 → Test win conditions → Deploy/Demo
5. Add User Story 4 → Test restart → Deploy/Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Server is authority on all game state and timing
- No in-game chat - players communicate in real life
- Each player sees content in their selected locale
