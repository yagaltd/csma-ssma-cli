# csma-ssma-cli

Bootstrap a fresh project from the CSMA frontend templates and SSMA gateway templates.

`csma-ssma-cli` is a template initializer. It creates a new project folder, copies the selected CSMA and/or SSMA baseline into it, and writes an `AGENTS.md` file for coding agents.

## What It Does

- Creates a new app directory from CSMA and/or SSMA template sources
- Lets you choose meaningful top-level setup options such as architecture, platform, SSMA runtime, and store adapter
- Copies a ready starting point for frontend, backend, or full-stack work
- Generates a single `AGENTS.md` file in the output project

## What It Does Not Do

- It does not try to design the whole app architecture
- It does not treat every component or package as an interactive decision
- It does not require users to prune every optional platform or development file up front

## Recommended Usage

### GitHub template sources

```bash
npx -y github:yagaltd/csma-ssma-cli \
  --template-source github \
  --csma-repo yagaltd/CSMA \
  --ssma-repo yagaltd/SSMA
```

### Local template sources

```bash
node ./bin/csma-ssma.js \
  --template-source local \
  --csma-path ../CSMA \
  --ssma-path ../SSMA
```

## Main Choices

- Architecture: `csma`, `ssma`, or `csma-ssma`
- Platform: `web`, `capacitor`, or `neutralino` for CSMA projects
- SSMA runtime: `js` or `rust`
- SSMA store adapter: `none`, `file`, or `sqlite`
- Optional dev helper: include the SSMA toy backend for JS gateway projects

## Generated Output

Typical output looks like:

```text
my-app/
  AGENTS.md
  package.json
  src/            # CSMA app when selected
  ssma/           # SSMA runtime when selected
```

The generated project is a starter baseline. Users can keep, remove, or extend platform- and app-specific pieces after scaffolding.

## Next Step After Scaffold

Open the generated project and start building from the copied baseline:

```bash
cd my-app
```

Read:

- the generated `AGENTS.md`
- the generated `package.json`
- the copied CSMA/SSMA docs included in the scaffold

## Sources

- CSMA: https://github.com/yagaltd/CSMA
- SSMA: https://github.com/yagaltd/SSMA
