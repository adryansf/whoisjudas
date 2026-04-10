# Tasks: Biblical Game UI Remodeling

**Input**: Design documents from `/specs/002-biblical-game-ui-remodel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: No tests requested - UI remodeling via visual inspection

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup required - modifying existing components only

*This phase is N/A for this feature - all changes are in-place component updates*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: This phase establishes the base patterns and audit that apply to ALL components before user story work begins

**⚠️ CRITICAL**: Complete these foundational checks before component updates

- [x] T001 Audit all hardcoded color values in `apps/web/src/components/` and create replacement mapping table per research.md
- [x] T002 [P] Verify theme color tokens available in `packages/ui/src/styles/globals.css` match requirements

**Checkpoint**: Hardcoded colors audited - ready to begin component updates

---

## Phase 3: User Story 1 - Theme-Aware Visual Design (Priority: P1) 🎯 MVP

**Goal**: All game components use theme-aware color tokens instead of hardcoded colors, working correctly in both light and dark modes

**Independent Test**: Toggle between light and dark themes in browser DevTools; verify all text is readable and colors adapt correctly

### Implementation for User Story 1

- [x] T003 [P] [US1] Update `apps/web/src/components/game/role-card.tsx` - replace `text-red-500` with `text-destructive` and `text-green-500` with `text-primary` for Judas/Disciple role indicators
- [x] T004 [P] [US1] Update `apps/web/src/components/game/player-list.tsx` - replace `bg-green-500` with `bg-emerald-500` or theme token, replace `bg-gray-400` with `bg-muted-foreground`
- [x] T005 [P] [US1] Update `apps/web/src/components/game/connection-status.tsx` - replace `bg-red-500` with `bg-destructive`, replace `bg-yellow-500` with `bg-yellow-600 dark:bg-yellow-400`
- [x] T006 [P] [US1] Update `apps/web/src/components/game/question-phase.tsx` - replace hardcoded red colors `border-red-500/50 bg-red-500/10 text-red-500` with `border-destructive/50 bg-destructive/10 text-destructive`
- [x] T007 [P] [US1] Update `apps/web/src/components/game/vote-phase.tsx` - verify `border-primary bg-primary/10` uses proper theme token; add `dark:` variant if missing
- [x] T008 [P] [US1] Update `apps/web/src/components/game/timer.tsx` - ensure `text-destructive` used for low-time warning instead of any hardcoded red
- [x] T009 [US1] Update `apps/web/src/components/game/error-display.tsx` - ensure `text-destructive` and `bg-destructive/10` used for error states
- [x] T010 [US1] Update `apps/web/src/components/game/loading.tsx` - ensure `border-primary border-t-transparent` spinner uses theme tokens
- [x] T011 [US1] Update `apps/web/src/components/header.tsx` - ensure navigation links use `text-foreground` and dividers use `border-border`
- [x] T012 [US1] Update `apps/web/src/components/loader.tsx` - ensure spinner uses `text-primary`

**Checkpoint**: All components in apps/web/src/components/ use theme tokens - no hardcoded colors remain

---

## Phase 4: User Story 2 - Consistent Biblical Theme Colors (Priority: P2)

**Goal**: Biblical game aesthetic (gold, deep blue, rich purple) consistent across all components with proper theme adaptation

**Independent Test**: Visual inspection of all game screens in both light and dark themes; verify gold (primary) and purple/blue (secondary/accent) tones are cohesive

### Implementation for User Story 2

- [x] T013 [P] [US2] Review `apps/web/src/components/game/lobby.tsx` - ensure room code uses `text-primary` for emphasis, background colors use theme tokens
- [x] T014 [P] [US2] Review `apps/web/src/components/game/story-guess-modal.tsx` - verify `border-primary bg-primary/10` for selected state, `border-border` for default state
- [x] T015 [P] [US2] Review `apps/web/src/components/game/player-list.tsx` - ensure host badge uses `bg-primary text-primary-foreground` per theme
- [x] T016 [US2] Review all game components for biblical theme cohesion - verify primary (gold), secondary (deep blue), accent colors are consistent per globals.css
- [x] T017 [US2] Test background image visibility - verify UI text readable over background in both themes per FR-010

**Checkpoint**: Biblical theme colors consistent across all components in both themes

---

## Phase 5: User Story 3 - Interactive Element Clarity (Priority: P3)

**Goal**: All interactive elements (buttons, vote targets, modals) clearly communicate state with proper mobile touch targets

**Independent Test**: Interact with buttons, vote targets, modals; verify hover/selected states visible; verify touch targets are minimum 44x44px on mobile viewport

### Implementation for User Story 3

- [x] T018 [P] [US3] Update `apps/web/src/components/game/vote-phase.tsx` - ensure vote target buttons have clear selected state with `border-primary bg-primary/10`, hover state with `hover:bg-muted`
- [x] T019 [P] [US3] Update `apps/web/src/components/game/story-guess-modal.tsx` - verify story selection buttons show clear selected state, buttons have `min-h-[44px]` for touch target
- [x] T020 [P] [US3] Update `apps/web/src/components/game/lobby.tsx` - ensure Start/Leave buttons have clear states, `min-h-[44px]` touch target
- [x] T021 [US3] Update `apps/web/src/components/game/timer.tsx` - verify low-time warning uses `text-destructive` with size emphasis (text-3xl or larger)
- [x] T022 [US3] Update `apps/web/src/components/game/error-display.tsx` - ensure retry button has `min-h-[44px]` touch target and clear `hover:bg-muted` state

**Checkpoint**: All interactive elements have clear states and adequate touch targets

---

## Phase 6: Mobile Responsiveness & Polish

**Purpose**: Ensure mobile-first design works across all viewports, fix overflow issues, proper z-index stacking

- [x] T023 [P] Update `apps/web/src/components/game/lobby.tsx` - add `overflow-x-hidden` to root container, wrap player list in scrollable container with `max-h-[300px] overflow-y-auto`
- [x] T024 [P] Update `apps/web/src/components/game/player-list.tsx` - ensure player items don't overflow, truncate long names with `truncate`
- [x] T025 [P] Update `apps/web/src/components/game/question-phase.tsx` - add `overflow-x-hidden` to root, ensure buttons have `min-h-[44px]`
- [x] T026 [P] Update `apps/web/src/components/game/vote-phase.tsx` - add `overflow-x-hidden`, vote target buttons `min-h-[44px]`
- [x] T027 [P] Update `apps/web/src/components/game/loading.tsx` - replace `min-h-[calc(100vh-4rem)]` with `min-h-dvh` or `min-h-[100dvh]` for mobile viewport reliability
- [x] T028 [P] Update `apps/web/src/components/game/error-display.tsx` - replace `min-h-[calc(100vh-4rem)]` with `min-h-dvh`
- [x] T029 [P] Update `apps/web/src/components/game/connection-status.tsx` - verify z-index (z-50), ensure `safe-area-inset-top` padding for notched devices
- [x] T030 [P] Update `apps/web/src/components/header.tsx` - verify `supports-[backdrop-filter]:backdrop-blur-sm` for mobile browser chrome
- [x] T031 Verify all components use `overflow-x-hidden` on root elements to prevent horizontal scroll
- [x] T032 Final visual inspection at 320px, 768px, and 1440px viewport widths

**Checkpoint**: Mobile responsive, no overflow issues, proper z-index stacking

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A - no setup required
- **Foundational (Phase 2)**: No dependencies - can start immediately
- **User Stories (Phase 3-5)**: All depend on Foundational phase audit complete
  - US1 (P1 - Theme Colors) → Start first as MVP
  - US2 (P2 - Biblical Theme) → Can run parallel with US1 or after
  - US3 (P3 - Interactive Elements) → Can run parallel with US1/US2 or after
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after audit - no dependencies on other stories (MVP)
- **User Story 2 (P2)**: Can start parallel with US1 or immediately after
- **User Story 3 (P3)**: Can start parallel with US1/US2 or immediately after
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- Component updates marked [P] can run in parallel (different files)
- Sequential tasks (marked without [P]) must run in order within their component

### Parallel Opportunities

- All tasks marked [P] can run in parallel (different files, no dependencies)
- US1, US2, US3 can be worked on in parallel by different developers
- Phase 6 polish tasks marked [P] can run in parallel

---

## Parallel Example: MVP First (User Story 1 Only)

```bash
# All US1 component updates marked [P] can run in parallel:
Task: "Update role-card.tsx - replace red-500/green-500"
Task: "Update player-list.tsx - replace green-500/gray-400"
Task: "Update connection-status.tsx - replace red-500/yellow-500"
Task: "Update question-phase.tsx - replace hardcoded red colors"
Task: "Update vote-phase.tsx - verify primary theme token"
Task: "Update timer.tsx - ensure destructive for warning"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational audit
2. Complete Phase 3: User Story 1 (Theme-Aware Visual Design)
3. **STOP and VALIDATE**: Test in light/dark mode
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational audit
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Visual theme consistency check → Deploy/Demo
4. Add User Story 3 → Interactive element check → Deploy/Demo
5. Add Phase 6 Polish → Final mobile responsiveness → Deploy/Demo

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable via visual inspection
- Toggle light/dark mode in browser DevTools to verify theme switching
- Use responsive design mode in DevTools to test mobile viewports
- Verify touch targets using browser DevTools accessibility panel
- Avoid: using hardcoded colors like `red-500`, `green-500`, `gray-400`, `yellow-500`
- Always use theme tokens: `text-primary`, `text-destructive`, `bg-muted`, `border-border`, etc.