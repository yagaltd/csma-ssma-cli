# csma-ssma-cli

Interactive scaffolder for CSMA/SSMA projects.

## Local Install

```bash
cd /home/aurel/Documents/CSMA-SSMA/CLI
npm install
npm link
```

## Run (Interactive)

```bash
csma-ssma
```

The CLI prompts for architecture, runtime, platform, modules, and output project name.

## Typical Local Usage

```bash
csma-ssma --template-source local \
  --csma-path /home/aurel/Documents/CSMA-SSMA/CSMA \
  --ssma-path /home/aurel/Documents/CSMA-SSMA/SSMA
```

## Typical GitHub Usage

```bash
csma-ssma --template-source github \
  --csma-repo yagaltd/CSMA \
  --ssma-repo yagaltd/SSMA
```

Optional: pin a branch/tag/commit with `--template-ref <ref>`.

## Non-Interactive Mode

```bash
csma-ssma --yes --architecture csma-ssma --platform capacitor --project-name my-app
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
