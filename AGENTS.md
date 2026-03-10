# AGENTS.md

This project was scaffolded from CSMA and/or SSMA templates. Treat the generated codebase as a starter baseline: inspect what exists first, then extend it with small, explicit changes.

## Mission

Build a maintainable, secure application on top of:

- CSMA for frontend runtime, modules, services, and UI structure
- SSMA for realtime gateway, optimistic sync, transport, and backend mediation

Prioritize correctness, contracts, and incremental delivery over broad rewrites.

## Read First

Before making changes, inspect:

- `README.md`
- top-level `package.json`
- `src/` when CSMA is present
- `ssma/` when SSMA is present
- copied CSMA and SSMA docs that ship with this scaffold

Do not assume every generated project contains both frontend and backend pieces.

## Working Rules

- Respect the generated project structure before introducing new patterns
- Prefer extending existing modules and services over creating parallel abstractions
- Keep APIs, contracts, and event shapes explicit and versioned
- Keep diffs small unless the task explicitly requires architectural change
- Do not treat example or starter code as production-ready by default

## CSMA Rules

When `src/` is present:

- Use EventBus-oriented orchestration and existing runtime boundaries
- Keep module boundaries strict; avoid direct feature-to-feature coupling
- Place feature work under `src/modules/<name>/` when it is module-level behavior
- Place UI primitives and patterns under `src/ui/components/` and `src/ui/patterns/`
- Follow the copied CSMA docs and local runtime/config conventions before changing bootstrap behavior

## SSMA Rules

When `ssma/` is present:

- Route backend-facing realtime behavior through SSMA gateway boundaries
- Validate payloads against shared contracts and existing runtime expectations
- Keep auth, persistence, replay, and transport concerns inside the gateway layer
- Preserve runtime parity expectations when the scaffold includes SSMA JS or Rust sources

## Security and Operations

- Never commit secrets, tokens, or filled `.env` files
- Validate untrusted input at boundaries
- Prefer `.env.example` for documented configuration
- Keep auth, rate limits, and permission defaults conservative

## Workflow

1. Inspect the generated structure and commands that actually exist
2. Identify whether the task is frontend, backend, or full-stack
3. Implement the smallest safe change that fits the scaffolded baseline
4. Run the narrowest relevant checks
5. Update docs or contracts when behavior changes

## Validation Expectations

- Tests or checks relevant to the edited behavior should pass
- New code should not leave dead imports or stale references
- Behavior/config changes should be reflected in docs when needed
- Architecture changes should be deliberate, not accidental drift from the copied baseline

## Common Pitfalls

- Replacing the scaffold baseline before understanding it
- Introducing duplicate patterns instead of extending existing runtime/module structure
- Treating generated examples as production architecture
- Changing contracts or bootstrapping without updating the matching code paths
