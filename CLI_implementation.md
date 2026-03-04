# CLI Implementation Plan

## Overview

Create a CLI tool that scaffolds new projects using CSMA (frontend) and/or SSMA (backend) templates. The CLI will:
1. Ask the user for project configuration options
2. Copy template files from CSMA and/or SSMA repositories
3. Generate a `CLAUDE.md` or `AGENTS.md` with project-specific rules
4. Set up the project structure with selected modules/components

---

## Repository Structure

### Source Repositories (to be created on GitHub)

| Repo | Purpose |
|------|---------|
| `CSMA` | Frontend framework (current: `/home/aurel/Documents/CSMA-SSMA/CSMA`) |
| `SSMA` | Backend middleware (current: `/home/aurel/Documents/CSMA-SSMA/SSMA`) |
| `csma-ssma-cli` | CLI tool (new repository) |

### How CLI Fetches Templates

MVP should be local-first (no GitHub required):
- Default: copy from local paths (`CSMA_PATH`, `SSMA_PATH`, or sibling directories)
- Optional: `--template-source github` to clone specific tag/release
- Optional: `--latest` for cutting-edge templates

---

## CLI Architecture

```
csma-ssma-cli/
├── bin/
│   └── csma-ssma.js          # Entry point (npm bin)
├── src/
│   ├── index.js              # Main CLI logic
│   ├── prompts.js            # Inquirer questions
│   ├── generator.js          # File generation
│   ├── templates/            # Template overrides
│   │   └── claude-md.js      # CLAUDE.md template
│   └── utils/
│       ├── git.js            # Git operations
│       ├── file.js           # File operations
│       └── modules.js        # Module metadata
├── package.json
└── README.md
```

---

## Implementation Steps

### Step 1: Initialize CLI Project

```bash
mkdir csma-ssma-cli
cd csma-ssma-cli
npm init -y
npm pkg set type="module"
npm pkg set bin.csma-ssma="./bin/csma-ssma.js"
npm install inquirer ejs fs-extra
```

### Step 2: Create Entry Point

**File:** `bin/csma-ssma.js`

```javascript
#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runCli } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

runCli(rootDir);
```

### Step 3: Define Prompts (Configuration Questions)

**File:** `src/prompts.js`

```javascript
import inquirer from 'inquirer';

export async function askProjectInfo() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input) => input.length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: '',
    },
    {
      type: 'list',
      name: 'architecture',
      message: 'Architecture:',
      choices: [
        { name: 'CSMA only (frontend only)', value: 'csma' },
        { name: 'CSMA + SSMA (full stack)', value: 'csma-ssma' },
        { name: 'SSMA only (backend only)', value: 'ssma' },
      ],
    },
  ]);

  // Conditional prompts based on architecture
  if (answers.architecture !== 'csma') {
    const ssmaAnswers = await askSSMAConfig();
    Object.assign(answers, ssmaAnswers);
  }

  if (answers.architecture !== 'ssma') {
    const csmaAnswers = await askCSMAConfig();
    Object.assign(answers, csmaAnswers);
  }

  const agentAnswers = await askAgentConfig();
  Object.assign(answers, agentAnswers);

  return answers;
}

async function askSSMAConfig() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'ssmaRuntime',
      message: 'SSMA Runtime:',
      choices: [
        { name: 'JavaScript (Node.js)', value: 'js' },
        { name: 'Rust', value: 'rust' },
      ],
      when: (answers) => answers.architecture === 'ssma' || answers.architecture === 'csma-ssma',
    },
    {
      type: 'list',
      name: 'ssmaStore',
      message: 'Intent Store Adapter:',
      choices: [
        { name: 'File (JSON files)', value: 'file' },
        { name: 'SQLite', value: 'sqlite' },
      ],
      when: (answers) => answers.architecture === 'ssma' || answers.architecture === 'csma-ssma',
    },
  ]);
}

async function askCSMAConfig() {
  return inquirer.prompt([
    {
      type: 'checkbox',
      name: 'modules',
      message: 'Select modules:',
      choices: [
        { name: 'router - SPA routing', value: 'router' },
        { name: 'storage - IndexedDB wrapper', value: 'storage' },
        { name: 'i18n - Internationalization', value: 'i18n' },
        { name: 'ai - Multi-provider AI orchestration', value: 'ai' },
        { name: 'search - FlexSearch', value: 'search' },
        { name: 'file-system - File System Access API', value: 'file-system' },
        { name: 'camera - Photo/video capture', value: 'camera' },
        { name: 'media-capture - Audio recording', value: 'media-capture' },
        { name: 'location - Geolocation', value: 'location' },
        { name: 'media-transform - Media conversions', value: 'media-transform' },
        { name: 'image-optimizer - Image optimization', value: 'image-optimizer' },
        { name: 'form-management - Form state management', value: 'form-management' },
        { name: 'modal-system - Modal stack', value: 'modal-system' },
        { name: 'checkout - Checkout flow', value: 'checkout' },
        { name: 'data-table - Data table utilities', value: 'data-table' },
        { name: 'network-status - Online/offline', value: 'network-status' },
        { name: 'sync-queue - Background sync', value: 'sync-queue' },
        { name: 'optimistic-sync - Optimistic sync', value: 'optimistic-sync' },
        { name: 'static-render - Static rendering', value: 'static-render' },
        { name: 'llm (service-only) - LLM instructor service', value: 'llm' },
      ],
      when: (answers) => answers.architecture === 'csma' || answers.architecture === 'csma-ssma',
    },
    {
      type: 'checkbox',
      name: 'components',
      message: 'Select UI components:',
      choices: [
        { name: 'button', value: 'button' },
        { name: 'input', value: 'input' },
        { name: 'textarea', value: 'textarea' },
        { name: 'select', value: 'select' },
        { name: 'checkbox', value: 'checkbox' },
        { name: 'radio', value: 'radio' },
        { name: 'switch', value: 'switch' },
        { name: 'slider', value: 'slider' },
        { name: 'card', value: 'card' },
        { name: 'dialog', value: 'dialog' },
        { name: 'dropdown', value: 'dropdown' },
        { name: 'popover', value: 'popover' },
        { name: 'tooltip', value: 'tooltip' },
        { name: 'toast', value: 'toast' },
        { name: 'alert-dialog', value: 'alert-dialog' },
        { name: 'avatar', value: 'avatar' },
        { name: 'badge', value: 'badge' },
        { name: 'progress', value: 'progress' },
        { name: 'skeleton', value: 'skeleton' },
        { name: 'tabs', value: 'tabs' },
        { name: 'accordion', value: 'accordion' },
        { name: 'breadcrumb', value: 'breadcrumb' },
        { name: 'pagination', value: 'pagination' },
        { name: 'carousel', value: 'carousel' },
        { name: 'datepicker', value: 'datepicker' },
        { name: 'file-upload', value: 'file-upload' },
        { name: 'otp', value: 'otp' },
        { name: 'navbar', value: 'navbar' },
      ],
      when: (answers) => answers.architecture === 'csma' || answers.architecture === 'csma-ssma',
    },
    {
      type: 'checkbox',
      name: 'patterns',
      message: 'Select UI patterns:',
      choices: [
        { name: 'sidebar', value: 'sidebar' },
        { name: 'data-table', value: 'data-table' },
        { name: 'modal-system', value: 'modal-system' },
        { name: 'checkout', value: 'checkout' },
        { name: 'auth-ui', value: 'auth-ui' },
        { name: 'search-demo', value: 'search-demo' },
      ],
      when: (answers) => answers.architecture === 'csma' || answers.architecture === 'csma-ssma',
    },
    {
      type: 'list',
      name: 'platform',
      message: 'Platform:',
      choices: [
        { name: 'Web (default)', value: 'web' },
        { name: 'Capacitor (iOS/Android)', value: 'capacitor' },
        { name: 'Neutralino (Desktop)', value: 'neutralino' },
      ],
      when: (answers) => answers.architecture === 'csma' || answers.architecture === 'csma-ssma',
    },
    {
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include examples?',
      default: false,
      when: (answers) => answers.architecture === 'csma' || answers.architecture === 'csma-ssma',
    },
  ]);
}

async function askAgentConfig() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'agentConfig',
      message: 'Agent configuration:',
      choices: [
        { name: 'CLAUDE.md (Claude Code)', value: 'claude' },
        { name: 'AGENTS.md (Agent framework)', value: 'agents' },
        { name: 'Both', value: 'both' },
        { name: 'None', value: 'none' },
      ],
    },
  ]);
}
```

### Step 4: Create File Generator

**File:** `src/generator.js`

```javascript
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateProject(options, rootDir) {
  const targetDir = path.join(process.cwd(), options.projectName);

  console.log(`\n📁 Creating project: ${options.projectName}`);
  console.log(`   Target: ${targetDir}\n`);

  // Create target directory
  await fs.ensureDir(targetDir);
  await fs.emptyDir(targetDir);

  // Fetch templates (clone or copy from local)
  const templateDir = await fetchTemplates(options, rootDir);

  // Generate based on architecture
  if (options.architecture === 'csma' || options.architecture === 'csma-ssma') {
    await generateCSMA(options, templateDir, targetDir);
  }

  if (options.architecture === 'ssma' || options.architecture === 'csma-ssma') {
    await generateSSMA(options, templateDir, targetDir);
  }

  // Generate agent config
  if (options.agentConfig !== 'none') {
    await generateAgentConfig(options, targetDir);
  }

  // Generate package.json
  await generatePackageJson(options, targetDir);

  // Clean up temp template dir
  await fs.remove(templateDir);

  console.log(`\n✅ Project created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${options.projectName}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
}

async function fetchTemplates(options, rootDir) {
  // For now, copy from local repos
  // TODO: Support git clone from GitHub
  const tempDir = path.join(rootDir, '.temp-templates');

  // These paths should be configurable or cloned from GitHub
  const csmaSource = process.env.CSMA_PATH || path.join(rootDir, '..', 'CSMA');
  const ssmaSource = process.env.SSMA_PATH || path.join(rootDir, '..', 'SSMA');

  await fs.ensureDir(tempDir);

  if (options.architecture !== 'ssma') {
    await fs.copy(csmaSource, path.join(tempDir, 'csma'), {
      filter: (src) => {
        // Exclude node_modules, tests, docs, examples
        const rel = path.relative(csmaSource, src);
        return !rel.startsWith('node_modules') &&
               !rel.startsWith('tests') &&
               !rel.startsWith('docs') &&
               !rel.startsWith('examples') &&
               !rel.startsWith('site');
      },
    });
  }

  if (options.architecture !== 'csma') {
    await fs.copy(ssmaSource, path.join(tempDir, 'ssma'), {
      filter: (src) => {
        const rel = path.relative(ssmaSource, src);
        return !rel.startsWith('docs') &&
               !rel.startsWith('.github') &&
               !rel.startsWith('.old') &&
               !rel.startsWith('apps/ssma-js/node_modules') &&
               !rel.startsWith('apps/ssma-js/logs') &&
               !rel.startsWith('apps/ssma-rust/target');
      },
    });
  }

  return tempDir;
}

async function generateCSMA(options, templateDir, targetDir) {
  const csmaDir = path.join(templateDir, 'csma');
  const srcDir = path.join(targetDir, 'src');

  // Copy core runtime
  await fs.copy(path.join(csmaDir, 'src', 'runtime'), path.join(srcDir, 'runtime'));

  // Copy selected modules
  if (options.modules?.length > 0) {
    for (const mod of options.modules) {
      const modPath = path.join(csmaDir, 'src', 'modules', mod);
      if (await fs.pathExists(modPath)) {
        await fs.copy(modPath, path.join(srcDir, 'modules', mod));
      }
    }
  }

  // Copy selected components
  if (options.components?.length > 0) {
    const compDir = path.join(csmaDir, 'src', 'ui', 'components');
    for (const comp of options.components) {
      const compPath = path.join(compDir, comp);
      if (await fs.pathExists(compPath)) {
        await fs.copy(compPath, path.join(srcDir, 'ui', 'components', comp));
      }
    }
  }

  // Copy selected patterns
  if (options.patterns?.length > 0) {
    const patDir = path.join(csmaDir, 'src', 'ui', 'patterns');
    for (const pat of options.patterns) {
      const patPath = path.join(patDir, pat);
      if (await fs.pathExists(patPath)) {
        await fs.copy(patPath, path.join(srcDir, 'ui', 'patterns', pat));
      }
    }
  }

  // Copy CSS foundation
  await fs.copy(path.join(csmaDir, 'src', 'css'), path.join(srcDir, 'css'));

  // Copy UI init
  await fs.copy(path.join(csmaDir, 'src', 'ui', 'init.js'), path.join(srcDir, 'ui', 'init.js'));

  // Optional examples
  if (options.includeExamples) {
    const examplesDir = path.join(csmaDir, 'examples');
    if (await fs.pathExists(examplesDir)) {
      await fs.copy(examplesDir, path.join(targetDir, 'examples'));
    }
  }

  // Copy index.html
  await fs.copy(path.join(csmaDir, 'index.html'), path.join(targetDir, 'index.html'));

  // Copy vite.config.js
  await fs.copy(path.join(csmaDir, 'vite.config.js'), path.join(targetDir, 'vite.config.js'));

  // Generate config.js with selected features
  await generateConfig(options, targetDir);

  // Generate main.js
  await generateMain(options, targetDir);

  // Platform-specific setup
  if (options.platform && options.platform !== 'web') {
    await setupPlatform(options.platform, targetDir, csmaDir);
  }
}

async function generateConfig(options, targetDir) {
  const configPath = path.join(targetDir, 'src', 'config.js');

  // Build feature flags based on selections
  const features = {
    VALIDATION: true,
    EVENT_BUS: true,
    SERVICE_MANAGER: true,
    PWA: options.platform === 'web',
    ROUTER: options.modules?.includes('router'),
    I18N: options.modules?.includes('i18n'),
    INDEXEDDB: options.modules?.includes('storage'),
    STORAGE: options.modules?.includes('storage'),
    AI_MODULE: options.modules?.includes('ai'),
    LLM_INSTRUCTOR: options.modules?.includes('llm'),
    SEARCH_MODULE: options.modules?.includes('search'),
    FILE_SYSTEM: options.modules?.includes('file-system'),
    CAMERA_MODULE: options.modules?.includes('camera'),
    MEDIA_CAPTURE: options.modules?.includes('media-capture'),
    LOCATION_MODULE: options.modules?.includes('location'),
    MEDIA_TRANSFORM: options.modules?.includes('media-transform'),
    IMAGE_OPTIMIZER: options.modules?.includes('image-optimizer'),
    FORM_MANAGEMENT: options.modules?.includes('form-management'),
    MODAL_SYSTEM: options.modules?.includes('modal-system'),
    CHECKOUT_MODULE: options.modules?.includes('checkout'),
    DATA_TABLE_MODULE: options.modules?.includes('data-table'),
    NETWORK_STATUS_MODULE: options.modules?.includes('network-status'),
    SYNC_QUEUE: options.modules?.includes('sync-queue'),
    OPTIMISTIC_SYNC: options.modules?.includes('optimistic-sync'),
    STATIC_RENDER: options.modules?.includes('static-render'),
  };

  const configContent = `/**
 * Feature Configuration
 * Generated by csma-ssma-cli
 */
export const FEATURES = ${JSON.stringify(features, null, 4)};

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

  await fs.writeFile(configPath, configContent);
}

async function generateMain(options, targetDir) {
  const enabledModules = options.modules || [];
  const dynamicModules = enabledModules.filter((mod) => mod !== 'llm');

  const mainContent = `/**
 * CSMA Main Entry
 * Generated by csma-ssma-cli
 */

import { EventBus } from './runtime/EventBus.js';
import { ServiceManager } from './runtime/ServiceManager.js';
import { ModuleManager } from './runtime/ModuleManager.js';
import { FEATURES } from './config.js';

// Initialize core
const eventBus = new EventBus();
const serviceManager = new ServiceManager(eventBus);
const moduleManager = new ModuleManager(eventBus, serviceManager);

// Export for use in modules
export { eventBus, serviceManager, moduleManager, FEATURES };

// Bootstrap application
export async function init() {
    console.log('[CSMA] Initializing...');

    // Load standard modules (those exporting manifest + services in index.js)
${dynamicModules.length > 0
    ? dynamicModules.map((mod) => `    await moduleManager.loadModule('${mod}');`).join('\n')
    : '    // No standard modules selected'}

    // Special case: llm module currently ships as a service (no modules/llm/index.js)
${enabledModules.includes('llm')
    ? `    if (FEATURES.LLM_INSTRUCTOR) {
        const { LLMService } = await import('./modules/llm/services/LLMService.js');
        serviceManager.register('llm', new LLMService());
    }`
    : '    // LLM service not selected'}

    console.log('[CSMA] Ready');
}

// Auto-init if this is the main module
if (import.meta.url === window.location.href) {
    init().catch(console.error);
}
`;

  await fs.writeFile(path.join(targetDir, 'src', 'main.js'), mainContent);
}

async function generateSSMA(options, templateDir, targetDir) {
  const ssmaDir = path.join(templateDir, 'ssma');
  const runtime = options.ssmaRuntime || 'js';
  const runtimeDir = path.join(ssmaDir, 'apps', `ssma-${runtime}`);

  // Copy SSMA runtime
  await fs.copy(runtimeDir, path.join(targetDir, 'ssma'), {
    filter: (src) => {
      const rel = path.relative(runtimeDir, src);
      return !rel.startsWith('node_modules');
    },
  });

  // Generate .env file
  const envContent = `# SSMA Configuration
# Generated by csma-ssma-cli

# Server
PORT=3000
HOST=localhost

# Store Adapter (file or sqlite)
SSMA_OPTIMISTIC_ADAPTER=${options.ssmaStore || 'file'}

# Auth
JWT_SECRET=change-me-in-production
JWT_EXPIRY=7d

# Backend
BACKEND_URL=http://localhost:8080

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limits
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
`;

  await fs.writeFile(path.join(targetDir, 'ssma', '.env'), envContent);

  // Update package.json for the selected store adapter
  const pkgPath = path.join(targetDir, 'ssma', 'package.json');
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    if (options.ssmaStore === 'sqlite') {
      pkg.dependencies['better-sqlite3'] = '^9.0.0';
    } else {
      delete pkg.dependencies['better-sqlite3'];
    }
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }
}

async function generateAgentConfig(options, targetDir) {
  const projectName = options.projectName;

  if (options.agentConfig === 'claude' || options.agentConfig === 'both') {
    const claudeMd = `# ${projectName}

This project uses CSMA/SSMA architecture.

## Architecture
- ${options.architecture}

${options.architecture !== 'ssma' ? `## CSMA Configuration
- Modules: ${(options.modules || []).join(', ') || 'none'}
- Components: ${(options.components || []).join(', ') || 'none'}
- Platform: ${options.platform || 'web'}
` : ''}

${options.architecture !== 'csma' ? `## SSMA Configuration
- Runtime: ${options.ssmaRuntime || 'js'}
- Store: ${options.ssmaStore || 'file'}
` : ''}

## Project Structure
- \`src/\` - Source code (CSMA)
- \`ssma/\` - Backend (SSMA)
- \`src/contracts/\` - Intent contracts
- \`src/modules/\` - Feature modules
- \`src/ui/\` - UI components and patterns

## Conventions
- All events must have contracts defined in \`src/contracts/\`
- Use CSS-class reactivity (update className, not style directly)
- Prefix intents with \`INTENT_\`, events with \`EVENT_\`
- Feature flags in \`src/config.js\`

## Commands
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
`;

    await fs.writeFile(path.join(targetDir, 'CLAUDE.md'), claudeMd);
  }

  if (options.agentConfig === 'agents' || options.agentConfig === 'both') {
    const agentsMd = `# Agent Configuration for ${projectName}

## Overview
This project uses CSMA (Client-Side Microservices Architecture) and SSMA (Stable State Middleware Architecture).

## Architecture
${options.architecture === 'csma' ? 'Frontend only (CSMA)' :
  options.architecture === 'ssma' ? 'Backend only (SSMA)' :
  'Full stack (CSMA + SSMA)'}

## CSMA Rules
${options.architecture !== 'ssma' ? `
### Event Contracts
- All pub/sub events must be defined in \`src/runtime/Contracts.js\`
- Use \`eventBus.publish()\` for sending events
- Use \`eventBus.subscribe()\` for receiving events

### CSS Reactivity
- State changes should update \`element.className\`
- Visual updates handled by CSS, not JavaScript
- Avoid direct \`element.style\` manipulation

### Modules
Available modules: ${(options.modules || []).join(', ') || 'none'}
` : ''}

## SSMA Rules
${options.architecture !== 'csma' ? `
### Intent Flow
1. Client sends intent.batch via WebSocket
2. SSMA validates and persists intent
3. SSMA forwards to backend
4. SSMA broadcasts ACK + invalidations

### Configuration
- Runtime: ${options.ssmaRuntime || 'js'}
- Store: ${options.ssmaStore || 'file'}
- Port: 3000 (default)
` : ''}

## File Conventions
- \`src/runtime/*.js\` - Core runtime (do not modify)
- \`src/modules/*/index.js\` - Module entry points
- \`src/ui/components/*/index.js\` - UI components
- \`src/contracts/*.js\` - Event schemas
- \`ssma/src/config/env.js\` - SSMA configuration
`;

    await fs.writeFile(path.join(targetDir, 'AGENTS.md'), agentsMd);
  }
}

async function generatePackageJson(options, targetDir) {
  const deps = {
    'vite': '^5.0.0',
  };

  if (options.architecture === 'csma' || options.architecture === 'csma-ssma') {
    // Add CSMA dependencies based on modules
    if (options.modules?.includes('search')) {
      deps['flexsearch'] = '^0.7.0';
    }
  }

  const scripts = {};

  if (options.architecture === 'csma' || options.architecture === 'csma-ssma') {
    scripts.dev = 'vite';
    scripts.build = 'vite build';
    scripts.preview = 'vite preview';
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
    dependencies: deps,
  };

  await fs.writeJson(path.join(targetDir, 'package.json'), pkg, { spaces: 2 });
}

async function setupPlatform(platform, targetDir, csmaDir) {
  const platformDocs = {
    capacitor: 'docs/platforms/capacitor.md',
    neutralino: 'docs/platforms/neutralino.md',
  };

  // Copy platform docs
  const docPath = path.join(csmaDir, platformDocs[platform]);
  if (await fs.pathExists(docPath)) {
    await fs.copy(docPath, path.join(targetDir, 'PLATFORM-SETUP.md'));
  }

  // TODO: Copy platform-specific config files
}

```

### Step 5: Create Main CLI Entry

**File:** `src/index.js`

```javascript
import { askProjectInfo } from './prompts.js';
import { generateProject } from './generator.js';

export async function runCli(rootDir) {
  console.log(`
╔════════════════════════════════════════╗
║     CSMA-SSMA Project Scaffolder     ║
╚════════════════════════════════════════╝
  `);

  try {
    const options = await askProjectInfo();
    await generateProject(options, rootDir);
  } catch (error) {
    if (error.isTtyError) {
      console.error('\n❌ Prompt could not be rendered in this environment.');
    } else if (error.message === 'ABORTED') {
      console.log('\n👋 Cancelled by user.');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}
```

---

## File Structure of Generated Project

```
my-project/
├── CLAUDE.md                    # Agent rules (if selected)
├── AGENTS.md                    # Alternative agent rules (if selected)
├── package.json                 # Dependencies
├── vite.config.js              # Vite config
├── index.html                  # Entry with CSP
├── PLATFORM-SETUP.md          # Platform-specific guide (if not web)
├── src/
│   ├── main.js                 # CSMA bootstrap
│   ├── config.js               # Feature flags
│   ├── runtime/                # Core CSMA (EventBus, ServiceManager, etc.)
│   ├── modules/                # Selected modules
│   │   ├── router/
│   │   ├── storage/
│   │   └── ...
│   ├── ui/
│   │   ├── init.js
│   │   ├── components/         # Selected components
│   │   └── patterns/           # Selected patterns
│   ├── css/                    # CSS foundation
│   └── contracts/              # (empty, for user's contracts)
├── ssma/                       # (if SSMA selected)
│   ├── .env
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── app.js
│   │   ├── config/
│   │   ├── runtime/
│   │   ├── services/
│   │   └── routes/
│   └── scripts/
└── tests/                      # (empty)
```

---

## Future Enhancements (Post-MVP)

1. **GitHub Integration**
   - Clone from GitHub releases/tags instead of local paths
   - Support `--template` flag for specific versions

2. **Template Customization**
   - Allow users to provide custom template overrides
   - Support template variables in generated files

3. **Validation**
   - Verify generated project passes basic tests
   - Check contract definitions exist

4. **Update Command**
   - `csma-ssma update` to pull latest from templates
   - Merge new features without overwriting custom code

5. **Interactive Mode**
   - `csma-ssma add module <name>` to add modules to existing project
   - `csma-ssma add component <name>` to add components

6. **MCP Server**
   - Optional MCP server for Claude Code integration
   - Generate project from within Claude Code

---

## Configuration Options Summary

| Option | Values | Default |
|--------|--------|---------|
| architecture | csma, ssma, csma-ssma | - |
| ssmaRuntime | js, rust | js |
| ssmaStore | file, sqlite | file |
| modules | router, storage, ai, ... | [] |
| components | button, dialog, card, ... | [] |
| patterns | sidebar, data-table, ... | [] |
| platform | web, capacitor, neutralino | web |
| includeExamples | true, false | false |
| agentConfig | claude, agents, both, none | claude |
