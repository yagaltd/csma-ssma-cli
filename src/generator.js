import path from 'node:path';
import fs from 'fs-extra';
import { ensureEmptyTargetDir, copyIfExists } from './utils/fs.js';
import { resolveTemplateRepos } from './utils/sources.js';
import { findManifestById } from './utils/templates.js';

function resolveCsmaTemplateId(options, manifests = []) {
  const available = new Set((manifests || []).map((manifest) => manifest.templateId));
  const has = (templateId) => available.has(templateId);

  const platformSpecific = {
    capacitor: 'csma-capacitor-shell',
    neutralino: 'csma-neutralino-shell'
  };

  const byPlatform = options.platform ? platformSpecific[options.platform] : null;
  if (byPlatform && has(byPlatform)) {
    return byPlatform;
  }

  if (options.architecture === 'csma-ssma' && has('csma-web-plus-ssma-client')) {
    return 'csma-web-plus-ssma-client';
  }

  if (has('csma-base-web')) {
    return 'csma-base-web';
  }

  return manifests[0]?.templateId || null;
}

function matchSsmTemplateId(options) {
  if (options.ssmaRuntime === 'rust') {
    return 'ssma-rust-gateway';
  }
  return 'ssma-js-gateway';
}

async function copyManifestSourcePaths(manifest, repoRoot, targetDir) {
  if (!Array.isArray(manifest.sourcePaths)) {
    throw new Error(`Template ${manifest.templateId} is missing sourcePaths`);
  }

  for (const relPath of manifest.sourcePaths) {
    const src = path.join(repoRoot, relPath);
    const dest = path.join(targetDir, relPath);
    if (!(await fs.pathExists(src))) {
      throw new Error(`Missing source path from manifest ${manifest.templateId}: ${relPath}`);
    }
    await fs.copy(src, dest, {
      filter: (file) => !file.includes(`${path.sep}node_modules${path.sep}`)
    });
  }
}

async function filterCsmaSelections(options, targetDir) {
  const modulesDir = path.join(targetDir, 'src', 'modules');
  const componentsDir = path.join(targetDir, 'src', 'ui', 'components');
  const patternsDir = path.join(targetDir, 'src', 'ui', 'patterns');

  if (await fs.pathExists(modulesDir)) {
    const entries = await fs.readdir(modulesDir);
    for (const entry of entries) {
      if (!(options.modules || []).includes(entry)) {
        await fs.remove(path.join(modulesDir, entry));
      }
    }
  }

  if (await fs.pathExists(componentsDir)) {
    const entries = await fs.readdir(componentsDir);
    for (const entry of entries) {
      if (entry.endsWith('.css') || entry.endsWith('.js') || entry.endsWith('.html')) {
        continue;
      }
      if (!(options.components || []).includes(entry)) {
        await fs.remove(path.join(componentsDir, entry));
      }
    }
  }

  if (await fs.pathExists(patternsDir)) {
    const entries = await fs.readdir(patternsDir);
    for (const entry of entries) {
      if (!(options.patterns || []).includes(entry)) {
        await fs.remove(path.join(patternsDir, entry));
      }
    }
  }

  if (!options.includeExamples) {
    await fs.remove(path.join(targetDir, 'examples'));
  }

  // Template scaffolds should not ship framework showcase/demo content by default.
  await fs.remove(path.join(targetDir, 'docs'));
  await fs.remove(path.join(targetDir, 'src', 'pages'));
  await removeDemoHtmlFiles(path.join(targetDir, 'src', 'ui', 'components'));
  await removeDemoHtmlFiles(path.join(targetDir, 'src', 'ui', 'patterns'));

  await regenerateComponentCssIndex(options, targetDir);
  await regenerateUiInit(targetDir);
}

async function removeDemoHtmlFiles(rootDir) {
  if (!(await fs.pathExists(rootDir))) return;
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await removeDemoHtmlFiles(full);
      continue;
    }
    if (entry.name.endsWith('.demo.html') || entry.name === 'demos.html') {
      await fs.remove(full);
    }
  }
}

async function regenerateComponentCssIndex(options, targetDir) {
  const components = options.components || [];
  const patterns = options.patterns || [];
  const lines = [
    '/**',
    ' * Generated component CSS index',
    ' * Only imports selected component/pattern styles.',
    ' */',
    ''
  ];

  for (const component of components) {
    lines.push(`@import './${component}/${component}.css';`);
  }

  // Keep sidebar style import if selected because original CSMA uses it in component index.
  if (patterns.includes('sidebar')) {
    lines.push(`@import '../patterns/sidebar/sidebar.css';`);
  }

  if (components.length === 0 && !patterns.includes('sidebar')) {
    lines.push('/* No optional component or sidebar pattern styles selected. */');
  }

  lines.push('');
  await fs.writeFile(path.join(targetDir, 'src', 'ui', 'components', 'index.css'), lines.join('\n'));
}

async function regenerateUiInit(targetDir) {
  const content = `/**
 * Generated minimal UI initializer.
 * This scaffold keeps UI bootstrap dependency-free so component folders can be optional.
 */
export function initUI(_eventBus) {
  console.log('[CSMA UI] Minimal init');
  return {};
}
`;
  await fs.writeFile(path.join(targetDir, 'src', 'ui', 'init.js'), content);
}

async function writeCsmaConfig(options, targetDir) {
  const configPath = path.join(targetDir, 'src', 'config.js');
  const modules = options.modules || [];
  const features = {
    VALIDATION: true,
    EVENT_BUS: true,
    SERVICE_MANAGER: true,
    PWA: options.platform === 'web',
    ROUTER: modules.includes('router'),
    I18N: modules.includes('i18n'),
    INDEXEDDB: modules.includes('storage'),
    STORAGE: modules.includes('storage'),
    AI_MODULE: modules.includes('ai'),
    LLM_INSTRUCTOR: modules.includes('llm'),
    SEARCH_MODULE: modules.includes('search'),
    FILE_SYSTEM: modules.includes('file-system'),
    CAMERA_MODULE: modules.includes('camera'),
    MEDIA_CAPTURE: modules.includes('media-capture'),
    LOCATION_MODULE: modules.includes('location'),
    MEDIA_TRANSFORM: modules.includes('media-transform'),
    IMAGE_OPTIMIZER: modules.includes('image-optimizer'),
    FORM_MANAGEMENT: modules.includes('form-management'),
    MODAL_SYSTEM: modules.includes('modal-system'),
    CHECKOUT_MODULE: modules.includes('checkout'),
    DATA_TABLE_MODULE: modules.includes('data-table'),
    NETWORK_STATUS_MODULE: modules.includes('network-status'),
    SYNC_QUEUE: modules.includes('sync-queue'),
    OPTIMISTIC_SYNC: modules.includes('optimistic-sync'),
    STATIC_RENDER: modules.includes('static-render')
  };

  const content = `export const FEATURES = ${JSON.stringify(features, null, 2)};

export function isEnabled(feature) {
  return FEATURES[feature] === true;
}

export function requireFeature(feature) {
  if (!isEnabled(feature)) {
    throw new Error(\`Feature "\${feature}" is not enabled. Enable it in src/config.js\`);
  }
}

export const PROTOCOL = {
  subprotocol: '1.0.0'
};
`;

  await fs.writeFile(configPath, content);
}

async function writeCsmaMain(options, targetDir) {
  const modules = (options.modules || []).filter((name) => name !== 'llm');
  const loadLines = modules.length > 0
    ? modules.map((mod) => `  await moduleManager.loadModule('${mod}');`).join('\n')
    : '  // No standard modules selected';
  const llmLines = (options.modules || []).includes('llm')
    ? `  if (FEATURES.LLM_INSTRUCTOR) {
    const { LLMService } = await import('./modules/llm/services/LLMService.js');
    serviceManager.register('llm', new LLMService());
  }`
    : '  // LLM service not selected';

  const content = `import { EventBus } from './runtime/EventBus.js';
import { ServiceManager } from './runtime/ServiceManager.js';
import { ModuleManager } from './runtime/ModuleManager.js';
import { FEATURES } from './config.js';

const eventBus = new EventBus();
const serviceManager = new ServiceManager(eventBus);
const moduleManager = new ModuleManager(eventBus, serviceManager);

export { eventBus, serviceManager, moduleManager, FEATURES };

export async function init() {
  console.log('[CSMA] Initializing...');
${loadLines}
${llmLines}
  console.log('[CSMA] Ready');
}

if (import.meta.url === window.location.href) {
  init().catch(console.error);
}
`;

  await fs.writeFile(path.join(targetDir, 'src', 'main.js'), content);
}

async function writeSsmaEnvExample(options, targetDir) {
  const adapterLine = options.ssmaStore && options.ssmaStore !== 'none'
    ? `SSMA_OPTIMISTIC_ADAPTER=${options.ssmaStore}`
    : '# SSMA_OPTIMISTIC_ADAPTER is not set (configure manually)';

  const content = `# Copy this file to .env and configure values for your environment.
# Example:
#   cp .env.example .env

PORT=3000
HOST=localhost
${adapterLine}
JWT_SECRET=change-me-in-production
JWT_EXPIRY=7d
BACKEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
`;
  await fs.remove(path.join(targetDir, 'ssma', '.env'));
  await fs.writeFile(path.join(targetDir, 'ssma', '.env.example'), content);
}

async function filterSsmaExamples(options, targetDir) {
  if (options.includeToyBackend) {
    return;
  }
  await fs.remove(path.join(targetDir, 'ssma', 'examples', 'toy-backend'));
}

async function pruneEmptyDirs(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(rootDir, entry.name);
    await pruneEmptyDirs(full);
    const remaining = await fs.readdir(full);
    if (remaining.length === 0) {
      await fs.remove(full);
    }
  }
}

async function writeAgentDocs(options, rootDir, targetDir) {
  const source = path.join(rootDir, 'AGENTS.md');
  if (!(await fs.pathExists(source))) {
    throw new Error('Missing required scaffold file: AGENTS.md');
  }
  await fs.copyFile(source, path.join(targetDir, 'AGENTS.md'));
}

async function writeRootPackageJson(options, targetDir) {
  const scripts = {};
  const dependencies = {};

  if (options.architecture === 'csma' || options.architecture === 'csma-ssma') {
    scripts.dev = 'vite';
    scripts.build = 'vite build';
    scripts.preview = 'vite preview';
    dependencies.vite = '^5.0.0';
    if ((options.modules || []).includes('search')) {
      dependencies.flexsearch = '^0.7.0';
    }
  }

  if (options.architecture === 'ssma' || options.architecture === 'csma-ssma') {
    scripts['dev:ssma'] = options.ssmaRuntime === 'rust'
      ? 'cd ssma && cargo run'
      : 'cd ssma && npm run dev';
  }

  const pkg = {
    name: options.projectName,
    description: options.description || '',
    type: 'module',
    scripts,
    dependencies
  };

  await fs.writeJson(path.join(targetDir, 'package.json'), pkg, { spaces: 2 });
}

function warnCompatibility(manifest) {
  const range = manifest?.compat?.recommendedCli;
  if (range) {
    console.warn(`[compat] Template ${manifest.templateId} recommends CLI ${range}. Continuing with best effort.`);
  }
}

export async function generateProject(options, rootDir, baseDir = process.cwd()) {
  const targetDir = await ensureEmptyTargetDir(baseDir, options.projectName);
  const { csmaRoot, ssmaRoot } = await resolveTemplateRepos(options, rootDir);

  const csmaTemplateId = resolveCsmaTemplateId(options, options.templateCatalog.manifests.csma);
  const csmaManifest = options.architecture === 'ssma'
    ? null
    : findManifestById(options.templateCatalog.manifests.csma, csmaTemplateId);

  const ssmaManifest = options.architecture === 'csma'
    ? null
    : findManifestById(options.templateCatalog.manifests.ssma, matchSsmTemplateId(options));

  if (options.architecture !== 'ssma') {
    if (!csmaManifest) {
      throw new Error('Unable to locate CSMA template manifest for selected architecture.');
    }
    warnCompatibility(csmaManifest);
    await copyManifestSourcePaths(csmaManifest, csmaRoot, targetDir);
    await filterCsmaSelections(options, targetDir);
    await writeCsmaConfig(options, targetDir);
    await writeCsmaMain(options, targetDir);

    if (options.platform && options.platform !== 'web') {
      const docMap = {
        capacitor: 'docs/platforms/capacitor.md',
        neutralino: 'docs/platforms/neutralino.md'
      };
      const platformDoc = docMap[options.platform];
      if (platformDoc) {
        await copyIfExists(path.join(csmaRoot, platformDoc), path.join(targetDir, 'PLATFORM-SETUP.md'));
      }
    }
  }

  if (options.architecture !== 'csma') {
    if (!ssmaManifest) {
      throw new Error('Unable to locate SSMA template manifest for selected runtime.');
    }
    warnCompatibility(ssmaManifest);
    const tempRuntime = path.join(targetDir, '.ssma-temp');
    await copyManifestSourcePaths(ssmaManifest, ssmaRoot, tempRuntime);

    const runtimeFolder = options.ssmaRuntime === 'rust' ? 'apps/ssma-rust' : 'apps/ssma-js';
    await fs.move(path.join(tempRuntime, runtimeFolder), path.join(targetDir, 'ssma'), { overwrite: true });
    await fs.remove(tempRuntime);
    await filterSsmaExamples(options, targetDir);
    await writeSsmaEnvExample(options, targetDir);
  }

  await writeAgentDocs(options, rootDir, targetDir);
  await writeRootPackageJson(options, targetDir);
  await pruneEmptyDirs(targetDir);

  return { targetDir };
}
