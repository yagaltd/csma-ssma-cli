export function renderClaudeMd(options) {
  return `# ${options.projectName}

This project was scaffolded with csma-ssma-cli.

## Architecture
- ${options.architecture}

## CSMA
- Modules: ${(options.modules || []).join(', ') || 'none'}
- Components: ${(options.components || []).join(', ') || 'none'}
- Patterns: ${(options.patterns || []).join(', ') || 'none'}
- Platform: ${options.platform || 'web'}

## SSMA
- Runtime: ${options.ssmaRuntime || 'n/a'}
- Store: ${options.ssmaStore || 'n/a'}

## Commands
- npm install
- npm run dev
`;
}
