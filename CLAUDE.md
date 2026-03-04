# AGENTS.md

Guide for projects scaffolded with CSMA (frontend) and SSMA (backend).

## 1) Mission

Build maintainable, secure, testable applications using:
- CSMA: Client-Side Microservices Architecture (frontend runtime + modules)
- SSMA: Stable State Middleware Architecture (gateway for optimistic sync/backends)

Prioritize correctness, explicit contracts, and incremental change.

## 2) Architecture Summary

### CSMA (frontend)
- EventBus-based module orchestration.
- Feature-flag driven module loading in `src/config.js`.
- Modules live under `src/modules/<module-name>/`.
- UI primitives/patterns live under `src/ui/components` and `src/ui/patterns`.
- Keep state transitions predictable and event-driven.

### SSMA (backend)
- Gateway receives intents, validates contracts, persists state, forwards to backend.
- Shared protocol/contracts under `packages/ssma-protocol` (in SSMA repo).
- Runtime variants: JS and Rust.
- Use `.env.example` as configuration template; avoid committing secrets.

## 3) Repo Structure (scaffolded project)

Typical generated layout:
- `src/` : CSMA app source
- `ssma/` : SSMA runtime (if selected)
- `package.json` : top-level scripts (`dev`, `dev:ssma`, etc.)

## 4) Coding Rules for Agents

- Respect current architecture and folder boundaries.
- Prefer extending existing modules/services over introducing parallel patterns.
- Do not introduce hidden coupling between modules.
- Keep APIs/contracts explicit and versionable.
- Keep diffs small and atomic.
- Preserve user-facing behavior unless change is requested.

## 5) Safety & Security

- Never commit credentials, tokens, keys, or real secrets.
- Validate untrusted input at boundaries.
- Fail closed for auth/permissions logic.
- Keep secure defaults in config and docs.

## 6) Testing Expectations

For each feature/fix:
- Add/adjust focused unit or integration tests.
- Verify scaffold commands still work.
- Ensure selected modules/features resolve without missing imports.

Minimum checks before merging:
- Tests pass.
- Generated project boots (`npm run dev` and/or `npm run dev:ssma` as applicable).
- No broken file references from selected options.

## 7) Agent Workflow

1. Read this file + project README.
2. Identify architecture mode: `csma`, `ssma`, or `csma-ssma`.
3. Locate affected modules/services.
4. Implement smallest safe change.
5. Run tests/verification.
6. Update docs when behavior/config changes.

## 8) Common Pitfalls

- Removing optional folders but leaving stale imports.
- Changing module flags without matching runtime init paths.
- Assuming SSMA examples are production components.
- Treating generated scaffold as final architecture (it is a starting baseline).

## 9) Notes for Generated Projects

- If both front and backend are used, run both processes during development:
  - `npm run dev`
  - `npm run dev:ssma`
- If only backend is used, run only SSMA command.
- If only frontend is used, run only Vite command.
