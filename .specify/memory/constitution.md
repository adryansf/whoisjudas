<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: None (initial creation)
Added sections: All (initial creation)
Removed sections: None
Templates status:
  - .specify/templates/plan-template.md: ✅ compatible (Constitution Check section present)
  - .specify/templates/spec-template.md: ✅ compatible (requirements structure aligns)
  - .specify/templates/tasks-template.md: ✅ compatible (phase structure aligns)
Follow-up TODOs: None
==================
-->

# whoisjudas Constitution

## Core Principles

### I. Simplicity First

The application MUST remain small and simple. Every feature, abstraction, or dependency added requires explicit justification.

**Rules:**
- Start with the simplest solution that solves the problem
- Avoid premature abstraction: wait for patterns to emerge naturally
- Reject solutions that add complexity without clear, immediate benefit
- When in doubt, choose the option with fewer moving parts

**Rationale:** A small codebase is easier to understand, debug, and maintain. Complexity compounds over time; starting simple preserves future options.

### II. Single Responsibility

Each module, function, and component MUST have one clear purpose. Coupling between modules MUST be minimized.

**Rules:**
- Functions do one thing and do it well
- Components have a single, well-defined responsibility
- Packages (`api`, `db`, `ui`) maintain clear boundaries
- Changes to one area should not cascade into others

**Rationale:** Clear responsibilities make code predictable. Low coupling enables independent changes and testing.

### III. Idiomatic Next.js and TypeScript

Code MUST follow Next.js App Router conventions and TypeScript best practices. Use the ecosystem's idioms before inventing new patterns.

**Rules:**
- Use Next.js file-based routing and Server Components by default
- Leverage TypeScript's type system fully—avoid `any`
- Follow existing project patterns (oRPC for APIs, Drizzle for database)
- Use shadcn/ui components from `packages/ui` for consistency

**Rationale:** Idiomatic code is recognizable to any Next.js/TypeScript developer. Framework conventions exist to solve common problems—use them.

### IV. Readability Over Cleverness

Code MUST be written for the next developer, not for the compiler. Clarity trumps brevity or cleverness.

**Rules:**
- Meaningful names: variables, functions, and types describe their purpose
- Flat structure over deep nesting
- Self-documenting code; comments explain "why", not "what"
- Avoid obscure patterns that require explanation

**Rationale:** Code is read far more often than written. A new developer should understand the codebase quickly without extensive documentation.

### V. YAGNI (You Aren't Gonna Need It)

Do not add features, abstractions, or dependencies for future hypothetical needs. Implement only what is required now.

**Rules:**
- No speculative generalization
- No unused configuration options
- No "just in case" utility functions
- Remove unused code immediately

**Rationale:** Speculative code adds maintenance burden without delivering value. Real requirements emerge from actual use, not prediction.

## Development Constraints

**Technology Stack:**
- Next.js (App Router) for full-stack web application
- TypeScript for type safety
- TailwindCSS + shadcn/ui for styling
- oRPC for type-safe APIs
- Drizzle ORM with PostgreSQL for data persistence
- Biome for linting and formatting

**Monorepo Structure:**
- `apps/web/` — Fullstack Next.js application
- `packages/ui/` — Shared shadcn/ui components
- `packages/api/` — API routes and business logic

## Quality Gates

**Before merging code:**
1. `pnpm run check` passes (Biome linting and formatting)
2. `pnpm run check-types` passes (TypeScript type checking)
3. No `any` types without explicit justification
4. New code follows existing patterns in the codebase
5. No new dependencies without necessity

## Governance

This constitution supersedes all other development practices. Amendments require:

1. Documentation of the proposed change
2. Justification for why the change is necessary
3. Migration plan for existing code if applicable

All pull requests and code reviews MUST verify compliance with these principles. When multiple solutions exist, choose the simplest one that solves the problem clearly and sustainably.

**Version**: 1.0.0 | **Ratified**: 2026-03-14 | **Last Amended**: 2026-03-14
