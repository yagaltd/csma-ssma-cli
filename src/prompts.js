import inquirer from 'inquirer';
import { loadTemplateCatalog } from './utils/templates.js';

export async function askProjectInfo(baseOptions, rootDir) {
  const catalog = await loadTemplateCatalog(baseOptions, rootDir);

  if (baseOptions.yes) {
    const architecture = baseOptions.architecture || 'csma';
    const defaults = {
      ...baseOptions,
      projectName: baseOptions.projectName || 'my-project',
      description: baseOptions.description || '',
      architecture,
      ssmaRuntime: architecture === 'ssma' || architecture === 'csma-ssma'
        ? (catalog.ssmaRuntimes[0]?.value || 'js')
        : undefined,
      ssmaStore: architecture === 'ssma' || architecture === 'csma-ssma' ? 'file' : undefined,
      modules: architecture === 'ssma' ? [] : [],
      components: architecture === 'ssma' ? [] : [],
      patterns: architecture === 'ssma' ? [] : [],
      platform: architecture === 'ssma'
        ? undefined
        : (catalog.csma.platforms[0]?.value || 'web'),
      includeExamples: false,
      agentConfig: 'none',
      templateCatalog: catalog
    };
    return defaults;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: baseOptions.projectName || undefined,
      validate: (input) => input.length > 0 || 'Name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: ''
    },
    {
      type: 'list',
      name: 'architecture',
      message: 'Architecture:',
      choices: catalog.architectures,
      default: baseOptions.architecture || undefined
    }
  ]);

  if (answers.architecture !== 'csma') {
    const ssmaAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'ssmaRuntime',
        message: 'SSMA Runtime:',
        choices: catalog.ssmaRuntimes.length > 0
          ? catalog.ssmaRuntimes
          : [
              { name: 'JavaScript (Node.js)', value: 'js' },
              { name: 'Rust', value: 'rust' }
            ]
      },
      {
        type: 'list',
        name: 'ssmaStore',
        message: 'Intent Store Adapter:',
        choices: [
          { name: 'File (JSON files)', value: 'file' },
          { name: 'SQLite', value: 'sqlite' }
        ]
      }
    ]);
    Object.assign(answers, ssmaAnswers);
  }

  if (answers.architecture !== 'ssma') {
    const csmaAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Select modules:',
        choices: catalog.csma.modules
      },
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select UI components:',
        choices: catalog.csma.components
      },
      {
        type: 'checkbox',
        name: 'patterns',
        message: 'Select UI patterns:',
        choices: catalog.csma.patterns
      },
      {
        type: 'list',
        name: 'platform',
        message: 'Platform:',
        choices: catalog.csma.platforms.length > 0
          ? catalog.csma.platforms
          : [{ name: 'web', value: 'web' }]
      },
      {
        type: 'confirm',
        name: 'includeExamples',
        message: 'Include examples?',
        default: false
      }
    ]);
    Object.assign(answers, csmaAnswers);
  }

  const agentAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentConfig',
      message: 'Agent configuration:',
      choices: [
        { name: 'CLAUDE.md', value: 'claude' },
        { name: 'AGENTS.md', value: 'agents' },
        { name: 'Both', value: 'both' },
        { name: 'None', value: 'none' }
      ]
    }
  ]);

  return {
    ...baseOptions,
    ...answers,
    templateCatalog: catalog
  };
}
