# Research: Biblical Game UI Remodeling

**Feature**: 002-biblical-game-ui-remodel
**Date**: 2026-04-03

## Research: Theme Color Strategy

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

## Research: Mobile Overflow Fixes

**Decision**: Use Tailwind responsive utilities with container scroll strategy

**Rationale**:
- `overflow-x-hidden` on root containers prevents horizontal scroll
- `overflow-y-auto` with `max-h-*` for long content (player lists, room codes)
- `100dvh` instead of `100vh` for mobile viewport height reliability
- Safe area insets via `env(safe-area-inset-*)` for notched devices

**Alternatives considered**:
- JavaScript measurement: Adds complexity, unnecessary
- CSS grid auto-fit: Works but flexbox is simpler for this case

## Research: Compound Component Pattern

**Decision**: Follow shadcn/ui pattern - each component exports sub-components

**Rationale**:
- Components already use this pattern (Card, CardHeader, CardContent, etc.)
- Dialog component exports Dialog, DialogContent, DialogHeader, DialogTitle
- Consistent API across all components
- Better composition than prop-based variants

**Alternatives considered**:
- Prop-based variants: Less flexible, creates prop hell
- Single component with slots: Works but less idiomatic for shadcn

## Research: Hardcoded Color Locations

Found hardcoded colors in:
- `role-card.tsx:30` - `text-red-500` / `text-green-500`
- `player-list.tsx:40` - `bg-green-500` / `bg-gray-400`
- `connection-status.tsx:26` - `bg-red-500` / `bg-yellow-500`
- `question-phase.tsx:73` - `border-red-500/50 bg-red-500/10 text-red-500`
- `vote-phase.tsx:71` - `border-primary bg-primary/10`

**Decision**: Replace hardcoded colors with semantic theme tokens:
- Use existing `destructive` (red) for Judas
- Use `primary` (gold) for Disciple - already theme-aware
- Create proper semantic mappings that work in both themes

## Theme Color Reference

| Purpose | Light Mode | Dark Mode | Tailwind Class |
|---------|------------|-----------|----------------|
| Judas role | Red | Red | `text-destructive` |
| Disciple role | Gold | Gold | `text-primary` |
| Connected | Green | Green | need semantic token |
| Disconnected | Gray | Gray | `bg-muted-foreground` |
| Warning | Yellow | Yellow | `text-yellow-600 dark:text-yellow-400` |

## Mobile Breakpoints

- Mobile: 320px - 768px
- Desktop: 769px+
- Use `sm:` for desktop overrides
- Use `max-md:` for mobile-specific styles

## Key Constraints

1. Do NOT modify `@packages/ui/` - only `@apps/web/src/components/`
2. Use shadcn compound component pattern for all components
3. Mobile-first with responsive breakpoints (coexist strategy)
4. Prevent horizontal overflow, z-index issues, viewport height problems
5. All colors must come from theme variables, no hardcoded values like `red-500`