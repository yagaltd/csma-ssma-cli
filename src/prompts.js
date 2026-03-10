import inquirer from 'inquirer';
import { loadTemplateCatalog } from './utils/templates.js';

const SELECT_ALL = '__ALL__';
const SELECT_NONE = '__NONE__';

function requiredModulesForArchitecture(architecture) {
  if (architecture === 'csma-ssma') {
    return ['network-status', 'sync-queue', 'optimistic-sync'];
  }
  return [];
}

function buildModuleChoices(catalogModules, requiredModules) {
  const requiredSet = new Set(requiredModules);
  const requiredChoices = requiredModules.map((mod) => ({
    name: `[Required] ${mod}`,
    value: mod,
    checked: true,
    disabled: 'Required for CSMA + SSMA mode'
  }));
  const optionalChoices = catalogModules
    .filter((choice) => !requiredSet.has(choice.value))
    .map((choice) => ({
      ...choice,
      name: `[Optional] ${choice.name}`
    }));

  return [
    { name: 'All optional modules', value: SELECT_ALL },
    { name: 'None optional modules', value: SELECT_NONE },
    ...requiredChoices,
    ...optionalChoices
  ];
}

function normalizeModuleSelection(selected, catalogModules, requiredModules) {
  const requiredSet = new Set(requiredModules);
  const optionalValues = catalogModules
    .map((choice) => choice.value)
    .filter((value) => !requiredSet.has(value));
  const selectedSet = new Set(selected);

  if (selectedSet.has(SELECT_ALL) && selectedSet.has(SELECT_NONE)) {
    throw new Error('Cannot select both "All optional modules" and "None optional modules".');
  }

  if (selectedSet.has(SELECT_ALL)) {
    return [...requiredModules, ...optionalValues];
  }

  if (selectedSet.has(SELECT_NONE)) {
    return [...requiredModules];
  }

  const cleaned = selected.filter((value) => value !== SELECT_ALL && value !== SELECT_NONE);
  const unique = Array.from(new Set([...requiredModules, ...cleaned]));
  return unique;
}

function buildOptionalChoices(baseChoices, labelPrefix = '[Optional]') {
  return [
    { name: 'All optional items', value: SELECT_ALL },
    { name: 'None optional items', value: SELECT_NONE },
    ...baseChoices.map((choice) => ({
      ...choice,
      name: `${labelPrefix} ${choice.name}`
    }))
  ];
}

function normalizeOptionalSelection(selected, baseChoices) {
  const selectedSet = new Set(selected);
  const baseValues = baseChoices.map((choice) => choice.value);

  if (selectedSet.has(SELECT_ALL) && selectedSet.has(SELECT_NONE)) {
    throw new Error('Cannot select both "All optional items" and "None optional items".');
  }
  if (selectedSet.has(SELECT_ALL)) {
    return [...baseValues];
  }
  if (selectedSet.has(SELECT_NONE)) {
    return [];
  }
  return selected.filter((value) => value !== SELECT_ALL && value !== SELECT_NONE);
}

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
      ssmaStore: architecture === 'ssma' || architecture === 'csma-ssma'
        ? (baseOptions.ssmaStore || 'file')
        : undefined,
      includeToyBackend: Boolean(baseOptions.includeToyBackend),
      modules: architecture === 'ssma' ? [] : requiredModulesForArchitecture(architecture),
      components: architecture === 'ssma' ? [] : [],
      patterns: architecture === 'ssma' ? [] : [],
      platform: architecture === 'ssma'
        ? undefined
        : (baseOptions.platform || catalog.csma.platforms[0]?.value || 'web'),
      includeExamples: false,
      agentConfig: 'agents',
      templateCatalog: catalog
    };
    return defaults;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name (letters, numbers, dot, underscore, hyphen only):',
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
          { name: 'None (configure manually later)', value: 'none' },
          { name: 'File (JSON files)', value: 'file' },
          { name: 'SQLite', value: 'sqlite' }
        ]
      },
      {
        type: 'confirm',
        name: 'includeToyBackend',
        message: 'Include toy backend simulator example? (SSMA dev/test helper)',
        default: false,
        when: (answers) => answers.ssmaRuntime === 'js'
      }
    ]);
    Object.assign(answers, ssmaAnswers);
  }

  if (answers.architecture !== 'ssma') {
    const requiredModules = requiredModulesForArchitecture(answers.architecture);
    const csmaAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Select modules:',
        choices: buildModuleChoices(catalog.csma.modules, requiredModules),
        validate: (selected) => {
          try {
            normalizeModuleSelection(selected, catalog.csma.modules, requiredModules);
            return true;
          } catch (error) {
            return error.message;
          }
        }
      },
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select UI components:',
        choices: buildOptionalChoices(catalog.csma.components),
        validate: (selected) => {
          try {
            normalizeOptionalSelection(selected, catalog.csma.components);
            return true;
          } catch (error) {
            return error.message;
          }
        }
      },
      {
        type: 'checkbox',
        name: 'patterns',
        message: 'Select UI patterns:',
        choices: buildOptionalChoices(catalog.csma.patterns),
        validate: (selected) => {
          try {
            normalizeOptionalSelection(selected, catalog.csma.patterns);
            return true;
          } catch (error) {
            return error.message;
          }
        }
      },
      {
        type: 'list',
        name: 'platform',
        message: 'Platform:',
        choices: catalog.csma.platforms.length > 0
          ? catalog.csma.platforms
          : [{ name: 'web', value: 'web' }],
        default: baseOptions.platform || undefined
      },
      {
        type: 'confirm',
        name: 'includeExamples',
        message: 'Include examples?',
        default: false
      }
    ]);
    csmaAnswers.modules = normalizeModuleSelection(csmaAnswers.modules, catalog.csma.modules, requiredModules);
    csmaAnswers.components = normalizeOptionalSelection(csmaAnswers.components, catalog.csma.components);
    csmaAnswers.patterns = normalizeOptionalSelection(csmaAnswers.patterns, catalog.csma.patterns);
    Object.assign(answers, csmaAnswers);
  }

  return {
    ...baseOptions,
    ...answers,
    agentConfig: 'agents',
    templateCatalog: catalog
  };
}
