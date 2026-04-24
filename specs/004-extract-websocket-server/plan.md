# Implementation Plan: Extrair WebSocket Server do Next.js

**Branch**: `004-extract-websocket-server` | **Date**: 2026-04-11 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/004-extract-websocket-server/spec.md`

## Summary

Extrair o servidor WebSocket (Socket.IO) do Next.js para um processo standalone em Node.js puro, utilizando `@socket.io/server` e integrando com `@whoisjudas/game` para lógica de jogo.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: `@socket.io/server`, `@whoisjudas/game`
**Storage**: N/A (in-memory, managed by @whoisjudas/game)
**Testing**: NEEDS CLARIFICATION
**Target Platform**: Node.js server (Linux)
**Project Type**: standalone-web-service (Socket.IO server)
**Performance Goals**: <5s startup, 100 concurrent events, <100MB memory with 50 rooms, <3s reconnect
**Constraints**: Standalone process with own port, retrocompatible Socket.IO API
**Scale/Scope**: 50 rooms active, 100 concurrent events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ | Minimal dependencies: socket.io/server + @whoisjudas/game only |
| II. Single Responsibility | ✅ | Server has single purpose: Socket.IO event handling |
| III. Idiomatic TypeScript | ✅ | TypeScript 5.x, no `any` types |
| IV. Readability Over Cleverness | ✅ | Clear naming, self-documenting code |
| V. YAGNI | ✅ | No speculative dependencies |

**GATE RESULT**: Pass - No violations

## Project Structure

### Documentation (this feature)

```text
specs/004-extract-websocket-server/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code

```text
server/                         # Standalone Socket.IO server
├── src/
│   ├── index.ts               # Entry point, HTTP server setup
│   ├── socket/
│   │   ├── handler.ts         # Socket.IO event handlers
│   │   └── rooms.ts           # Room management
│   └── lib/
│       └── rate-limit.ts       # Rate limiting
├── package.json
├── tsconfig.json
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Single standalone Node.js server project (`server/`). No monorepo needed - just `@socket.io/server` + `@whoisjudas/game` as dependencies. Server connects to frontend via configurable URL.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

## Phase 0: Research

**Status**: ✅ Complete

**Key Findings**:
- Node.js built-in HTTP module sufficient for Socket.IO
- Rate limiting: sliding window 5s/20 requests
- Multi-tab support via browserSessionId mapping
- Graceful shutdown sequence documented

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Artifacts Generated**:
- `research.md` - Socket.IO server patterns and configuration
- `data-model.md` - Entities, state transitions, validation rules
- `quickstart.md` - Development and production commands
- `contracts/events.md` - Socket.IO event contracts (pre-existing, unchanged)
