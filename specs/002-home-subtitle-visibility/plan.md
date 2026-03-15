# Implementation Plan: Home Page Subtitle Visibility

**Branch**: `002-home-subtitle-visibility` | **Date**: 2026-03-15 | **Spec**: `/specs/002-home-subtitle-visibility/spec.md`

## Summary

Update the subtitle styling on the home page to improve visibility and legibility. The current `text-muted-foreground` is too faded. We will switch to `text-foreground` and increase the size and weight.

## Technical Context

**Primary Dependencies**: Next.js, Tailwind CSS, shadcn/ui
**Target Platform**: Web (Mobile/Desktop)

## Project Structure

### Documentation (this feature)

```text
specs/002-home-subtitle-visibility/
├── spec.md
├── plan.md
└── tasks.md
```

## Proposed Changes

### Frontend

- Modify `apps/web/src/app/[locale]/page.tsx` to update the subtitle paragraph classes.
