# Feature Specification: Biblical Game UI Remodeling

**Feature Branch**: `002-biblical-game-ui-remodel`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: Interface remodeling. Redesign elements (not in @packages/ui/, only in @apps/web/src/components/ and className with tailwind. Ensure color scheme works clearly in both light and dark versions. Check colors in @packages/ui/src/styles/globals.css. Also check @apps/web/public/background.png to avoid visual difficulty. The application is a biblical game.

## Clarifications

### Session 2026-04-03

- Q: Mobile-first priority should take priority over existing design specifications, or should light/dark theme colors be adapted to work on both mobile and desktop with equal priority? → A: Coexist with responsive breakpoints - design works equally well on mobile and desktop
- Q: For components with potential overflow issues (like player lists, room codes, long text), what is the preferred strategy? → A: Scroll within container - use overflow-y-auto within component bounds, max-height limits
- Q: Which mobile component issues should receive the most attention during the remodel? → A: All of the above - z-index issues with fixed/sticky elements, viewport-related problems, and tap target sizing problems

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Theme-Aware Visual Design (Priority: P1)

As a player, I want the game interface to have clear, readable colors that work in both light and dark modes, so I can comfortably play during day or night.

**Why this priority**: Visual clarity is fundamental to game usability and enjoyment.

**Independent Test**: Can be tested by toggling between light/dark modes and verifying all UI elements remain visible and properly contrasted.

**Acceptance Scenarios**:

1. **Given** I am in light mode, **When** I view any game component (lobby, role-card, vote-phase), **Then** all text and interactive elements MUST have sufficient contrast against their backgrounds
2. **Given** I am in dark mode, **When** I view any game component, **Then** all text and interactive elements MUST have sufficient contrast against their backgrounds
3. **Given** I am viewing the game with the background image, **When** in either theme, **Then** UI text MUST remain readable over or alongside the background

---

### User Story 2 - Consistent Biblical Theme Colors (Priority: P2)

As a player, I want the color scheme to reflect a biblical game theme (gold, deep blue, rich purple) that feels cohesive across all components.

**Why this priority**: Theme consistency enhances immersion and brand identity.

**Independent Test**: Can be tested by reviewing all components across light/dark modes for color cohesion.

**Acceptance Scenarios**:

1. **Given** I am viewing role-card with Judas role, **When** the component renders, **Then** the red color used MUST come from theme variables (not hardcoded red-500) and MUST be visible in both themes
2. **Given** I am viewing role-card with disciple role, **When** the component renders, **Then** the green color used MUST come from theme variables and MUST be visible in both themes

---

### User Story 3 - Interactive Element Clarity (Priority: P3)

As a player, I want interactive elements (buttons, vote targets, modals) to clearly communicate their state and purpose.

**Why this priority**: Clear interactive elements prevent user errors and frustration.

**Independent Test**: Can be tested by interacting with each interactive element type and verifying visual feedback.

**Acceptance Scenarios**:

1. **Given** I am viewing vote buttons/targets, **When** I hover or select them, **Then** the visual state MUST change clearly (border, background change)
2. **Given** I am viewing the timer, **When** time is running low (under 30 seconds), **Then** the timer MUST visually emphasize urgency through color/size change

---

### Edge Cases

- What happens when the background image has very similar luminance to UI text colors in certain themes?
- How do components with layered backgrounds (cards over background) maintain readability?
- What about players with color vision deficiency - are there sufficient contrast ratios?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All color values used in `@apps/web/src/components/` MUST use Tailwind theme variables (e.g., `text-primary`, `bg-secondary`) instead of hardcoded color values like `red-500` or `green-500`
- **FR-002**: The `role-card.tsx` component MUST use semantic color tokens that adapt to light/dark themes for Judas (red) and Disciple (green) role indicators
- **FR-003**: The `connection-status.tsx` component MUST use theme-aware colors for connected/disconnected/reconnecting states
- **FR-004**: The `timer.tsx` component MUST use theme-aware colors for normal and low-time warning states
- **FR-005**: The `error-display.tsx` component MUST maintain proper contrast for error text and icons in both themes
- **FR-006**: The `vote-phase.tsx` component MUST use theme tokens for vote button states (default, hover, selected, disabled)
- **FR-007**: The `lobby.tsx` component MUST ensure room code display remains readable in both themes
- **FR-008**: The `header.tsx` component MUST use theme-aware colors for navigation links and dividers
- **FR-009**: All components MUST pass WCAG 2.1 AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- **FR-010**: Background image usage MUST NOT cause visual difficulty - either adjust image opacity/overlay for certain themes OR ensure components have sufficient backdrop contrast
- **FR-011**: All components in `@apps/web/src/components/` MUST be fully responsive and work equally well on mobile (320px+) and desktop viewports
- **FR-012**: Components MUST prevent horizontal overflow on small screens - use `overflow-x-hidden`, flexible grid/flexbox layouts, and text truncation where needed
- **FR-013**: Touch targets (buttons, vote targets, interactive elements) MUST be minimum 44x44px on mobile viewports
- **FR-014**: Long content (player lists, room codes, descriptions) MUST use scroll within container strategy with `overflow-y-auto` and max-height limits to prevent overall page overflow
- **FR-015**: Fixed/sticky elements (header, connection status banner) MUST have proper z-index layering and account for mobile browser chrome (notch, dynamic island) with safe-area insets
- **FR-016**: Viewport height issues (100vh on mobile) MUST be addressed using `100dvh` or calc() approaches for reliable mobile rendering
- **FR-017**: All interactive components MUST maintain proper z-index stacking contexts, especially during animations and modal transitions

### Key Entities *(include if feature involves data)*

- **Color Tokens**: CSS custom properties defined in globals.css for theme colors
- **UI Components**: Game components that consume color tokens via Tailwind classes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of color values in `@apps/web/src/components/` use theme variables (verified via linting/code review)
- **SC-002**: All text maintains minimum 4.5:1 contrast ratio in both light and dark modes (verified via accessibility testing)
- **SC-003**: Players can complete a full game session (lobby → question → vote → result) without reporting readability issues
- **SC-004**: No hardcoded color values like `red-500`, `green-500`, `yellow-500` remain in component className attributes
- **SC-005**: All components render correctly and without overflow on mobile viewports (320px to 768px) and desktop viewports (769px+)