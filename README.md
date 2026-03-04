# csma-ssma-cli

CLI orchestration tool for scaffolding projects from template-first `CSMA` and `SSMA` repositories.

## Install (local dev)

```bash
cd CLI
npm install
npm link
```

Then run:

```bash
csma-ssma
```

## Options

- `--template-source <local|github>`
- `--csma-path <path>`
- `--ssma-path <path>`
- `--template-ref <tag|branch|sha>`
- `--project-name <name>`
- `--architecture <csma|ssma|csma-ssma>`
- `--agent-config <claude|agents|both|none>`
- `--ssma-store <none|file|sqlite>`
- `--include-toy-backend` (SSMA JS simulator example)
- `--yes` (non-interactive defaults)

## Current source behavior

- Local source mode is fully implemented.
- GitHub source mode is intentionally stubbed in MVP and returns a clear error.
- Generated CSMA scaffolds are starter-focused:
  - component showcase/docs pages are removed by default
  - template docs/source demo pages are not copied into the generated app

## Module Selection Rules

- For `csma-ssma` architecture, these modules are required and auto-selected:
  - `network-status`
  - `sync-queue`
  - `optimistic-sync`
- Optional modules include quick selectors:
  - `All optional modules`
  - `None optional modules`
- UI components are always optional (never compulsory) and include quick selectors:
  - `All optional items`
  - `None optional items`
- UI patterns are always optional (never compulsory) and include quick selectors:
  - `All optional items`
  - `None optional items`

`sync-queue` is not universally required for all CSMA projects, but it is enforced in `csma-ssma` mode so generated full-stack scaffolds are offline/sync ready by default.

## SSMA Store Adapter

`Intent Store Adapter` supports:

- `none` (manual configuration later)
- `file`
- `sqlite`

## SSMA Toy Backend Simulator

- Optional SSMA JS example used for local integration testing.
- Prompted as: `Include toy backend simulator example? (SSMA dev/test helper)`
- Default is `false`.

## Testing

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```
