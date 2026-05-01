# Implementation Plan: Game Rules Modal

**Branch**: `005-rules-modal-button` | **Date**: 2026-04-30 | **Spec**: [link](../spec.md)
**Input**: Feature specification from `/specs/005-rules-modal-button/spec.md`

## Summary

Add a "Rules" button to the game page that opens a modal dialog displaying game rules. The modal uses existing shadcn Dialog component, adapts to mobile screens (320px+), and displays content in the user's locale (English or Portuguese).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16 App Router, shadcn/ui (Dialog component), next-intl
**Storage**: N/A (i18n translations in JSON files)
**Testing**: Project uses `pnpm run check` and `pnpm run lint`
**Target Platform**: Web (mobile-first, responsive)
**Project Type**: Web application (Next.js fullstack)
**Performance Goals**: Modal opens within 1 second, no unnecessary re-renders
**Constraints**: Must use existing shadcn components, i18n for all text
**Scale/Scope**: Single button + modal component, 2 translation files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Only adding a button and modal; no new dependencies |
| II. Single Responsibility | ✅ PASS | RulesModal and RulesButton are separate concerns |
| III. Idiomatic Next.js | ✅ PASS | Using existing Dialog from packages/ui |
| IV. Readability | ✅ PASS | Clear component structure with i18n |
| V. YAGNI | ✅ PASS | No speculative features |

**No violations detected. Phase 0 (research) not required - all unknowns resolved.**

## Project Structure

### Documentation (this feature)

```
specs/005-rules-modal-button/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md   # Quality checklist
```

### Source Code

```text
apps/web/
├── src/
│   ├── app/[locale]/game/[code]/
│   │   └── page.tsx                 # Add Rules button + modal
│   ├── components/game/
│   │   ├── rules-modal.tsx          # NEW: Rules modal component
│   │   └── rules-button.tsx         # NEW: Rules button component
│   └── i18n/messages/
│       ├── en.json                  # Add rules.* translations
│       └── pt-BR.json               # Add rules.* translations

packages/ui/
└── src/components/
    └── dialog.tsx                   # Existing - no changes needed
```

**Structure Decision**: Components go in `apps/web/src/components/game/` following existing patterns. Translations added to existing i18n files.

## Complexity Tracking

> No complexity violations - feature is straightforward button + modal with i18n

## Implementation Notes

### Optimization for Avoid Unnecessary Re-renders

Following user requirement "faça de forma otimizada evitando renderizações desnecessárias":

1. **RulesModal**: Wrap in `React.memo` since it receives stable props
2. **Rules content**: Use `useTranslations` hook - only re-renders when locale changes
3. **Dialog state**: Managed locally with `useState` in page, lifted if needed
4. **No unnecessary state**: Only `isOpen` needed for modal visibility

### Dialog Usage Pattern

The existing shadcn Dialog component (`packages/ui/src/components/dialog.tsx`) provides:
- Mobile-responsive overlay and content
- Built-in close button
- Portal rendering
- Proper focus management
- Keyboard accessibility

The Dialog component uses base-ui primitives and handles mobile natively.

### i18n Structure for Rules

Translations will be added under `rules` key:
- `rules.title`: Modal title
- `rules.objective`: Game objective
- `rules.roles`: Player roles explanation
- `rules.phases`: Game phases description
- `rules.winConditions`: Win/lose conditions
- `rules.howToPlay`: Brief how-to-play guide
