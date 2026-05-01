# Quickstart: Game Rules Modal

## Overview

This feature adds a "Rules" button and modal to the game page, displaying game rules in the user's locale (English or Portuguese).

## Implementation

### Files to Create/Modify

1. **New Components**:
   - `apps/web/src/components/game/rules-modal.tsx` - The rules modal component

2. **Modified Files**:
   - `apps/web/src/app/[locale]/game/[code]/page.tsx` - Add Rules button
   - `apps/web/src/i18n/messages/en.json` - Add English translations
   - `apps/web/src/i18n/messages/pt-BR.json` - Add Portuguese translations

### Usage

After implementation, players can:
1. Tap the "Rules" button on the game page
2. View game rules in their language
3. Close by tapping outside or the close button

### Testing

```bash
# Type check
pnpm run check-types

# Lint
pnpm run lint

# Both
pnpm test && npm run lint
```
