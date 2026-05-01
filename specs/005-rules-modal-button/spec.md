# Feature Specification: Game Rules Modal

**Feature Branch**: `005-rules-modal-button`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "Criar um botão que abre um modal (pode ser dialog do shadcn) já adaptado para dispositivos móveis. As regras se adaptarão a versão inglês ou português. O jogo é similar ao Spyfall. Onde é necessário no mínimo 3 jogadores, durante o jogo eles irão fazer perguntas uns aos outros. No fim, o objetivo é descobrir quem é o 'Judas' e o Judas deve tentar descobrir qual a história bíblica relatada. Cada jogador (exceto o Judas) tem uma função no jogo (Personagem). Pode ocorrer empate ou vitória de um dos lados, conforme as regras (Explore o código)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Game Rules (Priority: P1)

A player wants to read the game rules to understand how to play before or during a game session.

**Why this priority**: New players need to understand the game rules to enjoy the experience. This is essential for user onboarding and reducing confusion during gameplay.

**Independent Test**: Can be fully tested by tapping the rules button and verifying the modal displays correctly with all rules visible. Delivers value by enabling self-service learning.

**Acceptance Scenarios**:

1. **Given** a player is on the game page, **When** they tap the "Rules" button, **Then** a modal opens displaying the game rules
2. **Given** a player opens the rules modal, **When** the locale is set to English, **Then** all rules display in English
3. **Given** a player opens the rules modal, **When** the locale is set to Portuguese (pt-BR), **Then** all rules display in Portuguese
4. **Given** a player is viewing the rules modal, **When** they tap outside the modal or the close button, **Then** the modal closes
5. **Given** a player is viewing the rules on a mobile device, **When** the modal opens, **Then** the content is readable and properly formatted for small screens

---

### Edge Cases

- What happens when the player has slow network? Modal content loads instantly since it is already bundled
- What happens when player rotates device from portrait to landscape? Modal remains centered and readable
- What happens when player has very small screen (320px)? Text remains readable without horizontal scrolling

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Rules" button accessible from the home page, lobby page, and game page
- **FR-002**: System MUST display a modal dialog when the Rules button is tapped
- **FR-003**: System MUST display game rules content adapted to the current locale (en or pt-BR)
- **FR-004**: Modal MUST be responsive and work well on mobile devices with minimum 320px width
- **FR-005**: Modal MUST have a visible close button to dismiss it
- **FR-006**: Modal MUST close when user taps outside of it (overlay click)
- **FR-007**: Modal MUST not block other page interactions when closed
- **FR-008**: Rules content MUST include: objective, player roles (Disciple/Judas), game phases (Question, Vote, Reveal), and win conditions

### Key Entities

- **RulesModal**: A dialog component containing the game rules formatted for the current locale
- **RulesButton**: A button component that triggers the modal to open

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can open the rules modal within 1 second of tapping the button
- **SC-002**: Rules modal is fully readable on devices with 320px minimum screen width
- **SC-003**: Rules display correctly in both supported languages (English and Portuguese)
- **SC-004**: Modal can be closed and reopened multiple times without any degradation

## Assumptions

- The shadcn Dialog component will be used, which already supports mobile responsiveness via its design
- All text content will be stored in the existing i18n translation files
- The rules button will be placed in a consistent location on the game page
- Rules content will be concise but complete to fit mobile screens
