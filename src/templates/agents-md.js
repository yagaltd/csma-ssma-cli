export function renderAgentsMd(options) {
  return `# Agent Configuration for ${options.projectName}

## Architecture
- ${options.architecture}

## Conventions
- Keep contracts explicit and versioned.
- Prefer feature flags in src/config.js.
- Keep generated scaffold files as a starting point, then refine per project needs.

## Selected Features
- Modules: ${(options.modules || []).join(', ') || 'none'}
- Components: ${(options.components || []).join(', ') || 'none'}
- Patterns: ${(options.patterns || []).join(', ') || 'none'}
`;
}
