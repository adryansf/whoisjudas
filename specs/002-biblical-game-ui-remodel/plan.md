# Implementation Plan: Biblical Game UI Remodeling

**Branch**: `002-biblical-game-ui-remodel` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-biblical-game-ui-remodel/spec.md`

## Summary

Remodel the biblical game UI components to use theme-aware color tokens, be fully responsive (mobile-first with desktop coexistence), and prevent common mobile overflow/bug issues. All components must use shadcn compound component pattern and Tailwind theme variables instead of hardcoded colors.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16 (App Router), TailwindCSS, shadcn/ui components
**Storage**: N/A (UI-only feature)
**Testing**: Visual regression testing + manual testing on mobile viewports
**Target Platform**: Web (mobile + desktop browsers)
**Project Type**: Web application UI remodeling
**Performance Goals**: No performance degradation - maintain current load times
**Constraints**:
- Do NOT modify `@packages/ui/` - only `@apps/web/src/components/`
- Use shadcn compound component pattern for all components
- Mobile-first with responsive breakpoints (coexist strategy)
- Prevent horizontal overflow, z-index issues, viewport height problems
**Scale/Scope**: 11 game components + header, loader, locale-toggle, mode-toggle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Only modifying existing components, no new abstractions |
| II. Single Responsibility | ✅ PASS | Each component has single purpose; changes are targeted |
| III. Idiomatic Next.js/TypeScript | ✅ PASS | Using existing shadcn compound patterns, TypeScript |
| IV. Readability Over Cleverness | ✅ PASS | Using clear theme variable names instead of magic colors |
| V. YAGNI | ✅ PASS | Only what's needed for theme colors + mobile responsiveness |

**GATE Result**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-biblical-game-ui-remodel/
├── plan.md              # This file
├── research.md          # Phase 0 output (resolved: color strategy, component patterns)
├── data-model.md        # N/A - no data entities
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # N/A - no external interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/web/src/components/
├── game/
│   ├── connection-status.tsx    # [UPDATE] - theme-aware colors, mobile z-index
│   ├── error-display.tsx        # [UPDATE] - theme-aware colors, mobile responsive
│   ├── loading.tsx              # [UPDATE] - theme-aware colors, min-height fix
│   ├── lobby.tsx                # [UPDATE] - theme-aware colors, overflow scroll
│   ├── player-list.tsx          # [UPDATE] - theme-aware colors, scroll container
│   ├── question-phase.tsx       # [UPDATE] - theme-aware colors, responsive layout
│   ├── role-card.tsx            # [UPDATE] - semantic color tokens for Judas/Disciple
│   ├── story-guess-modal.tsx    # [UPDATE] - use dialog compound, mobile safe
│   ├── timer.tsx                # [UPDATE] - theme-aware colors, mobile touch target
│   └── vote-phase.tsx           # [UPDATE] - theme-aware colors, button states
├── header.tsx                   # [UPDATE] - theme-aware nav, divider
├── loader.tsx                   # [UPDATE] - theme-aware spinner
├── locale-toggle.tsx            # [MINIMAL] - already uses theme
└── mode-toggle.tsx              # [MINIMAL] - already uses theme
```

**Structure Decision**: Update existing components in-place. No new files needed.

## Phase 0: Research

### Research: Theme Color Strategy

**Decision**: Use CSS custom properties (Tailwind theme variables) via `@theme` directive

**Rationale**:
- globals.css already defines theme colors using oklch for consistency
- `:root` and `.dark` classes already handle light/dark switching
- Components must use `text-primary`, `bg-secondary`, etc. (not hardcoded)
- For role indicators (Judas/Disciple), create semantic class mappings via Tailwind

**Alternatives considered**:
- Inline styles: Rejected - breaks theme switching
- CSS modules: Overkill for this scope
- Style JSX: Not compatible with compound component pattern

### Research: Mobile Overflow Fixes

**Decision**: Use Tailwind responsive utilities with container scroll strategy

**Rationale**:
- `overflow-x-hidden` on root containers prevents horizontal scroll
- `overflow-y-auto` with `max-h-*` for long content (player lists, room codes)
- `100dvh` instead of `100vh` for mobile viewport height reliability
- Safe area insets via `env(safe-area-inset-*)` for notched devices

**Alternatives considered**:
- JavaScript measurement: Adds complexity, unnecessary
- CSS grid auto-fit: Works but flexbox is simpler for this case

### Research: Compound Component Pattern

**Decision**: Follow shadcn/ui pattern - each component exports sub-components

**Rationale**:
- Components already use this pattern (Card, CardHeader, CardContent, etc.)
- Dialog component exports Dialog, DialogContent, DialogHeader, DialogTitle
- Consistent API across all components
- Better composition than prop-based variants

**Alternatives considered**:
- Prop-based variants: Less flexible, creates prop hell
- Single component with slots: Works but less idiomatic for shadcn

### Research: Hardcoded Color Locations

Found hardcoded colors in:
- `role-card.tsx:30` - `text-red-500` / `text-green-500`
- `player-list.tsx:40` - `bg-green-500` / `bg-gray-400`
- `connection-status.tsx:26` - `bg-red-500` / `bg-yellow-500`
- `question-phase.tsx:73` - `border-red-500/50 bg-red-500/10 text-red-500`
- `vote-phase.tsx:71` - `border-primary bg-primary/10`

**Decision**: Replace hardcoded colors with semantic theme tokens:
- Create `text-danger` / `text-success` mappings OR
- Use existing `destructive` (red) and `primary` (gold) theme colors

## Phase 1: Design & Contracts

### Data Model

N/A - This is a UI-only feature with no data entities.

### Interface Contracts

N/A - No external interfaces. This is a frontend-only UI remodeling.

### Quickstart: Implementation Guide

```markdown
## Implementation Order

### Phase 1: Fix Hardcoded Colors
1. role-card.tsx - Replace red-500/green-500 with semantic theme tokens
2. player-list.tsx - Replace green-500/gray-400 with theme tokens
3. connection-status.tsx - Replace red-500/yellow-500 with theme tokens
4. question-phase.tsx - Replace red color hardcodes with destructive theme
5. vote-phase.tsx - Already uses primary, verify consistency

### Phase 2: Mobile Responsiveness
1. Add `overflow-x-hidden` to root containers
2. Add scroll containers for long content (player-list, lobby)
3. Fix `min-h-screen` to `min-h-dvh` or `min-h-[100dvh]`
4. Ensure touch targets are 44x44px minimum

### Phase 3: Z-Index & Fixed Elements
1. Review header z-index vs connection-status z-index
2. Ensure modals/dialogs have proper stacking
3. Test fixed elements on mobile with browser chrome

## Theme Color Reference

| Purpose | Light Mode | Dark Mode | Tailwind Class |
|---------|------------|-----------|----------------|
| Judas role | Red (#DC2626) | Red (#DC2626) | `text-destructive` |
| Disciple role | Green (#16A34A) | Green (#16A34A) | `text-primary` (gold) |
| Connected | Green (#22C55E) | Green (#22C55E) | `bg-emerald-500` → `bg-green-500` |
| Disconnected | Gray (#6B7280) | Gray (#6B7280) | `bg-muted-foreground` |
| Warning | Yellow (#EAB308) | Yellow (#EAB308) | `text-yellow-600` |

## Mobile Breakpoints

- Mobile: 320px - 768px
- Desktop: 769px+
- Use `sm:` for desktop overrides
- Use `max-md:` for mobile-specific styles
```

## Complexity Tracking

> No violations of Constitution principles. All changes are minimal and targeted.

| Change | Why Needed | Simpler Alternative Rejected Because |
|--------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Agent Context Update

**Required update**: Run `.specify/scripts/bash/update-agent-context.sh opencode` after plan completion to sync new technology (none - using existing stack only).

---

**Plan Status**: ✅ Phase 1 Complete
**Generated Artifacts**: research.md, quickstart.md (inline)
**Next Step**: Run `/speckit.tasks` to generate implementation tasks