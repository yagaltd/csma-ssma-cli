# csma-ssma-cli

Orchestration layer for scaffolding projects from template-first `CSMA` and `SSMA` repositories.

## Responsibilities

- Discover available templates from `templates/*/template.manifest.json` in source repos.
- Let developers choose architecture/runtime/features.
- Copy only required source paths into a new project.
- Generate agent guidance files (`CLAUDE.md` and/or `AGENTS.md`).

## Source Strategy

- Pre-release testing: local-path source mode is allowed.
- Public release default: GitHub source mode by tag/ref, with local override flags.

## Compatibility

CLI should perform best-effort compatibility checks using template manifest metadata and warn on mismatch.
