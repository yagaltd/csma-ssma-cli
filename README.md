# csma-ssma-cli

Interactive scaffolder for CSMA/SSMA projects.

## Quick Start (Recommended)

Run directly from GitHub with `npx` (no global install required):

```bash
npx -y github:yagaltd/csma-ssma-cli
```

Then choose options interactively.

## Scaffold From GitHub Templates

Use your CSMA/SSMA repos as template sources:

```bash
npx -y github:yagaltd/csma-ssma-cli \
  --template-source github \
  --csma-repo yagaltd/CSMA \
  --ssma-repo yagaltd/SSMA
```

Optional: pin a branch/tag/commit for both template repos:

```bash
--template-ref main
```

## Non-Interactive Example

```bash
npx -y github:yagaltd/csma-ssma-cli \
  --yes \
  --template-source github \
  --csma-repo yagaltd/CSMA \
  --ssma-repo yagaltd/SSMA \
  --architecture csma-ssma \
  --platform capacitor \
  --project-name my-app
```

## Local Development (CLI Contributors)

If you are developing the CLI itself:

```bash
cd /home/aurel/Documents/CSMA-SSMA/CLI
npm install
npm link
csma-ssma
```

## Help

```bash
csma-ssma --help
```

## Development Tests

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```
