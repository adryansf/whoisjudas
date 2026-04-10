# Feature Specification: Who Is Judas? - Social Deduction Game

**Feature Branch**: `001-social-deduction-game`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "Multiplayer social deduction game with biblical theme inspired by Spyfall and Among Us"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Join Game Lobby (Priority: P1)

A player wants to start a new game session and invite friends to play together.

**Why this priority**: Without a lobby system, no multiplayer gameplay is possible. This is the foundational user flow.

**Independent Test**: Can be fully tested by creating a room, sharing the code, and having another player join. Delivers value by enabling social gathering before gameplay.

**Acceptance Scenarios**:

1. **Given** a player opens the app, **When** they tap "Create Game", **Then** a new room is created with a unique shareable code and link
2. **Given** a player has a room code, **When** they enter the code and tap "Join", **Then** they enter the lobby and see other players
3. **Given** a lobby has 3-12 players, **When** the host taps "Start Game", **Then** the game begins
4. **Given** a lobby has fewer than 3 players, **When** the host tries to start, **Then** the system shows a warning that minimum players not met

---

### User Story 2 - Play a Complete Round (Priority: P1)

Players experience the core gameplay loop: receive roles, ask questions, vote, and see results.

**Why this priority**: This is the core game experience. Without it, the product has no gameplay value.

**Independent Test**: Can be fully tested by completing one full round with minimum players (3). Delivers the complete game experience.

**Acceptance Scenarios**:

1. **Given** a game starts, **When** roles are assigned, **Then** Disciples see the biblical story and their character, and Judas sees only their character without the story
2. **Given** the question phase begins, **When** players ask each other questions, **Then** all players can see questions and answers in real-time
3. **Given** the timer reaches zero, **When** question phase ends, **Then** voting phase begins automatically
4. **Given** all players have voted or timer expires, **When** voting ends, **Then** the game reveals who was Judas and what the story was

---

### User Story 3 - Win or Lose Determination (Priority: P2)

Players receive clear feedback on the outcome of each round.

**Why this priority**: Win conditions provide closure and motivation. Without clear outcomes, the game feels incomplete.

**Independent Test**: Can be tested by playing until voting ends and verifying correct winner determination.

**Acceptance Scenarios**:

1. **Given** voting ends with majority for Judas, **When** results show, **Then** Disciples win and see victory screen
2. **Given** voting ends with no clear majority or wrong player, **When** results show, **Then** Judas wins and sees victory screen
3. **Given** Judas correctly guesses the biblical story during the round, **When** they submit their guess, **Then** Judas wins immediately

---

### User Story 4 - Quick Game Restart (Priority: P3)

Players want to play multiple rounds without recreating the lobby.

**Why this priority**: Enables extended play sessions. The game is designed for multiple short rounds.

**Independent Test**: Can be tested by completing a round and starting another with the same group.

**Acceptance Scenarios**:

1. **Given** a round ends, **When** players tap "Play Again", **Then** a new round starts with the same players
2. **Given** a new round starts, **When** roles are reassigned, **Then** Judas role goes to a different player than previous round
3. **Given** a round ends, **When** some players leave, **Then** remaining players can still start if minimum count is met

---

### Edge Cases

- What happens when a player disconnects mid-game? System allows remaining players to continue if minimum count is met, otherwise remaining player(s) win
- What happens when only Judas remains? Disciples win by default
- What happens if Judas submits wrong story guess? Game continues normally, no penalty
- What happens when timer runs out during voting? Votes cast are counted, abstaining counts as no vote
- What happens when player count drops below 3 during game? Game ends, remaining players see notification

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow players to create game rooms with unique codes
- **FR-002**: System MUST allow players to join rooms via code or direct link
- **FR-003**: System MUST support 3-12 players per game room
- **FR-004**: System MUST randomly assign one player as Judas and remaining as Disciples
- **FR-005**: System MUST randomly select one biblical story per round from the available collection
- **FR-006**: System MUST assign character roles to all players that fit within the selected story
- **FR-007**: System MUST show Disciples the biblical story and their character
- **FR-008**: System MUST show Judas only their character (not the story)
- **FR-009**: System MUST provide real-time communication between all players in a room
- **FR-010**: System MUST enforce 5-10 minute round duration with visible timer
- **FR-011**: System MUST provide a voting mechanism where players select who they believe is Judas
- **FR-012**: System MUST reveal the true Judas and biblical story at round end
- **FR-013**: System MUST determine winners based on voting outcome or Judas story guess
- **FR-014**: System MUST allow Judas to guess the biblical story at any time during the round
- **FR-015**: System MUST support multiple rounds with the same player group
- **FR-016**: System MUST handle player disconnection gracefully without crashing the game
- **FR-017**: System MUST work on mobile, tablet, and desktop devices

### Key Entities

- **Game Room**: A session container with unique code, host player, current state (waiting/playing/ended), and player list
- **Player**: A participant with name, current role (Disciple/Judas), assigned character, and vote selection
- **Biblical Story**: A themed scenario with title, description, and list of valid character roles
- **Character Role**: A persona within a story that players are assigned (e.g., "Noah", "One of Noah's Sons", "A Dove")
- **Round**: A single game instance within a room, tracking phase (question/vote/reveal), timer, and outcome
- **Vote**: A player's selection of who they believe is Judas during voting phase

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can create or join a game in under 10 seconds from opening the app
- **SC-002**: New players understand the rules within 2 minutes of first play
- **SC-003**: Game rounds complete within 5-10 minutes as designed
- **SC-004**: System supports multiple simultaneous game rooms without interference
- **SC-005**: All player interactions (questions, votes, guesses) sync in under 500ms
- **SC-006**: Interface is fully functional and readable on mobile devices with 320px minimum width
- **SC-007**: Players can complete a full game loop (create → play → reveal) without external help

## Assumptions

- Players have stable internet connection for real-time gameplay
- Players understand basic social deduction game concepts
- Biblical stories are pre-defined and curated for respectful representation
- No user accounts required - players use temporary display names per session
- Single region deployment initially; global latency optimization is future work
