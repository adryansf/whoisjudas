# Tasks: Game Rules Modal

**Input**: Design documents from `/specs/005-rules-modal-button/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

---

## Phase 1: Translation Content

**Purpose**: Add all i18n translations for rules content

- [x] T001 [P] Add English rules translations in apps/web/src/i18n/messages/en.json
- [x] T002 [P] Add Portuguese rules translations in apps/web/src/i18n/messages/pt-BR.json

---

## Phase 2: User Story 1 - View Game Rules (Priority: P1) 🎯 MVP

**Goal**: Player can tap Rules button and view game rules in their language

**Independent Test**: Tap Rules button → Modal opens with rules → Close modal

### Implementation for User Story 1

- [x] T003 Create RulesModal component in apps/web/src/components/game/rules-modal.tsx
- [x] T004 Add Rules button to game page in apps/web/src/app/[locale]/game/[code]/page.tsx

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Ensure code quality and optimization

- [x] T005 [P] Run type check: pnpm run check-types
- [x] T006 [P] Run lint check: pnpm run lint
- [x] T007 Verify mobile responsiveness on small screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Translations)**: No dependencies - can start immediately
- **Phase 2 (User Story 1)**: Depends on Phase 1 completion
- **Phase 3 (Polish)**: Depends on Phase 2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 - No dependencies on other stories

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T005 and T006 can run in parallel (different commands)

---

## Parallel Example: User Story 1

```bash
# Launch translations together:
Task: "Add English rules translations in apps/web/src/i18n/messages/en.json"
Task: "Add Portuguese rules translations in apps/web/src/i18n/messages/pt-BR.json"

# Then create component:
Task: "Create RulesModal component in apps/web/src/components/game/rules-modal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Translations (T001, T002)
2. Complete Phase 2: User Story 1 (T003, T004)
3. **STOP and VALIDATE**: Test Rules button opens modal with correct content
4. Deploy/demo if ready

### Incremental Delivery

1. Add translations → Verify i18n works
2. Create RulesModal → Verify modal displays correctly
3. Add button to page → Verify full flow works
4. Polish → Deploy

---

## Notes

- No setup/foundational phases needed - project already exists
- No tests requested - verification is manual
- Feature is UI-only with i18n content
- Uses existing shadcn Dialog component
