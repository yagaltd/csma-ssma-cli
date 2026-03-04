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
- `--yes` (non-interactive defaults)

## Current source behavior

- Local source mode is fully implemented.
- GitHub source mode is intentionally stubbed in MVP and returns a clear error.

## Testing

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```
