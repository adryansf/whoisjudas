# Research: Game Rules Modal

**Feature**: 005-rules-modal-button  
**Date**: 2026-04-30

## Decisions

### Decision 1: Use shadcn Dialog component

**Chosen**: Use the existing Dialog component from `packages/ui`

**Rationale**: 
- Already integrated in project (`packages/ui/src/components/dialog.tsx`)
- Built on base-ui primitives, which handle mobile responsiveness natively
- Supports all required features: overlay close, close button, portal rendering
- Consistent with existing codebase patterns (used for character details modal)

**Alternatives considered**:
- Custom modal implementation: Rejected - violates YAGNI and simplicity
- Third-party modal library: Rejected - unnecessary dependency

### Decision 2: i18n for all rule content

**Chosen**: Store all rule text in next-intl translation files

**Rationale**:
- Project already uses next-intl for all text
- No need for new infrastructure
- Automatic locale switching
- Already supports en and pt-BR

**Alternatives considered**:
- Hardcoded text with conditional rendering: Rejected - not i18n compliant
- Separate JSON files per locale: Rejected - project uses next-intl

### Decision 3: Place Rules button in game page header area

**Chosen**: Add Rules button near the timer/phase indicator at top of game page

**Rationale**:
- Visible during gameplay for quick reference
- Follows existing UI patterns on the page
- Accessible without leaving current view

**Alternatives considered**:
- Header component: Would require more changes
- Floating action button: Could obscure game content
- Separate page: Too much navigation for quick reference

## Resolved Unknowns

No unknowns required resolution. All technical decisions were straightforward based on:
- Existing shadcn Dialog implementation
- Existing i18n infrastructure  
- Simple UI feature scope
