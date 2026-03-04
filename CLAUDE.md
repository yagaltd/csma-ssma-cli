# CLAUDE.md

This file guides Claude Code for projects scaffolded with CSMA (frontend) and SSMA (backend).

## 1) Mission

Build maintainable, secure, testable applications using:
- CSMA: Client-Side Microservices Architecture (frontend runtime + modules)
- SSMA: Stable State Middleware Architecture (gateway for optimistic sync/backends)

Prioritize correctness, explicit contracts, and incremental change.

## 2) Required Architecture Rules

### CSMA (frontend) - REQUIRED
- Use EventBus-based orchestration.
- Keep module boundaries strict: no direct module-to-module coupling.
- Keep feature-flag driven loading in `src/config.js`.
- Place modules under `src/modules/<module-name>/`.
- Place UI primitives/patterns under `src/ui/components` and `src/ui/patterns`.

### SSMA (backend) - REQUIRED
- All backend communication must go through SSMA gateway.
- Validate all payloads against shared contracts.
- Gateway handles validation, persistence, and forwarding.
- Shared protocol/contracts live in `packages/ssma-protocol` (SSMA repo).
- Runtime may be JS or Rust.

## 3) Scaffolded Repo Shape

Typical generated layout:
- `src/` : CSMA source
- `ssma/` : SSMA runtime (if selected)
- `package.json` : top-level scripts

## 4) Coding Rules

- Respect architecture and folder boundaries.
- Extend existing modules/services before adding parallel patterns.
- Keep APIs/contracts explicit and versioned.
- Keep diffs small, atomic, and behavior-preserving unless asked otherwise.

## 5) Security Rules

- Never commit secrets or private tokens.
- Validate untrusted input at boundaries.
- Use secure defaults for auth/permissions/rate limits.
- Prefer `.env.example`; generate `.env` only when needed by the user.

## 6) Testing Expectations

For each feature/fix:
- Add or adjust focused tests.
- Verify selected modules/features do not create missing imports.
- Verify scaffold output still runs for chosen architecture mode.

Minimum merge checks:
- Tests pass.
- No dead references from optional selections.
- Docs updated when behavior/config changes.

## 7) Project-Specific Commands (Fill During /init)

Replace this section with actual commands from generated `package.json` and `ssma/package.json`.

Frontend:
- `<fill: npm run dev>`
- `<fill: npm run build>`

Backend:
- `<fill: npm run dev:ssma>`
- `<fill: cd ssma && npm run test>`

## 8) Current Project Configuration (Fill During /init)

Document what is currently enabled for this generated project:
- Architecture mode (`csma`, `ssma`, or `csma-ssma`)
- Enabled modules
- Enabled UI components/patterns
- SSMA store adapter
- Optional examples/simulators included

## 9) Agent Workflow

1. Read this file and `README.md`.
2. Determine architecture mode and enabled selections.
3. Implement smallest safe change.
4. Run relevant checks.
5. Update docs/contracts when needed.

## 10) Common Pitfalls

- Leaving stale imports after optional folder removal.
- Treating example/simulator code as production default.
- Changing module flags without matching init/runtime paths.
- Treating scaffold baseline as final architecture.
