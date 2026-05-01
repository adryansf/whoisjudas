# Data Model: Game Rules Modal

**Feature**: 005-rules-modal-button  
**Date**: 2026-04-30

## Overview

This feature involves UI components and internationalized text content. No persistent data structures are required.

## Components

### RulesButton

A button component that triggers the rules modal to open.

**Props**: None (stateless trigger)

### RulesModal

A dialog component displaying game rules with i18n support.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Whether modal is visible |
| `onOpenChange` | `(open: boolean) => void` | Callback when modal should close |

### Internal State

- `isOpen`: Local boolean state for modal visibility

## i18n Translations

Added under `rules` namespace in `en.json` and `pt-BR.json`:

| Key | Description |
|-----|-------------|
| `rules.title` | Modal title (e.g., "How to Play") |
| `rules.objective` | Game objective explanation |
| `rules.roles.title` | Player roles section title |
| `rules.roles.disciple` | Disciple role description |
| `rules.roles.judas` | Judas role description |
| `rules.phases.title` | Game phases section title |
| `rules.phases.question` | Question phase description |
| `rules.phases.vote` | Vote phase description |
| `rules.phases.reveal` | Reveal phase description |
| `rules.winConditions.title` | Win conditions section title |
| `rules.winConditions.disciplesWin` | When disciples win |
| `rules.winConditions.judasWins` | When Judas wins |
| `rules.winConditions.tie` | When tie occurs |
| `rules.close` | Close button text |

## State Flow

```
User taps RulesButton → setShowRulesModal(true) → Dialog opens
User taps close/overlay → onOpenChange(false) → setShowRulesModal(false)
```

No persistence or shared state required - each player manages their own modal visibility locally.
