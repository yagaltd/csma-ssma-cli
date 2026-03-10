import path, { dirname } from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import { loadTemplateCatalog } from '../../src/utils/templates.js';
import { generateProject } from '../../src/generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const cliRoot = path.join(repoRoot, 'CLI');
const csmaRoot = path.join(repoRoot, 'CSMA');
const ssmaRoot = path.join(repoRoot, 'SSMA');

describe('generateProject integration', () => {
  it('generates a csma project in temp directory', async () => {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-int-'));
    const options = {
      projectName: 'app-csma',
      description: 'test',
      architecture: 'csma',
      templateSource: 'local',
      csmaPath: csmaRoot,
      ssmaPath: ssmaRoot,
      modules: ['router'],
      components: ['button'],
      patterns: ['sidebar'],
      platform: 'web',
      includeExamples: false
    };
    options.templateCatalog = await loadTemplateCatalog(options, cliRoot);

    try {
      const { targetDir } = await generateProject(options, cliRoot, workspace);
      expect(await fs.pathExists(path.join(targetDir, 'src', 'runtime', 'EventBus.js'))).toBe(true);
      expect(await fs.pathExists(path.join(targetDir, 'src', 'modules', 'router'))).toBe(true);
      expect(await fs.pathExists(path.join(targetDir, 'AGENTS.md'))).toBe(true);
      expect(await fs.pathExists(path.join(targetDir, 'CLAUDE.md'))).toBe(false);
    } finally {
      await fs.remove(workspace);
    }
  }, 20000);

  it('copies AGENTS.md from CLI root', async () => {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-int-'));
    const options = {
      projectName: 'app-docs',
      description: 'test',
      architecture: 'csma',
      templateSource: 'local',
      csmaPath: csmaRoot,
      ssmaPath: ssmaRoot,
      modules: [],
      components: [],
      patterns: [],
      platform: 'web',
      includeExamples: false
    };
    options.templateCatalog = await loadTemplateCatalog(options, cliRoot);

    try {
      const { targetDir } = await generateProject(options, cliRoot, workspace);
      const generatedAgents = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf8');
      const sourceAgents = await fs.readFile(path.join(cliRoot, 'AGENTS.md'), 'utf8');

      expect(generatedAgents).toBe(sourceAgents);
      expect(await fs.pathExists(path.join(targetDir, 'CLAUDE.md'))).toBe(false);
    } finally {
      await fs.remove(workspace);
    }
  }, 20000);

  it('selects platform-specific CSMA template when platform manifest exists', async () => {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-int-'));
    const options = {
      projectName: 'app-capacitor',
      description: 'test',
      architecture: 'csma',
      templateSource: 'local',
      csmaPath: csmaRoot,
      ssmaPath: ssmaRoot,
      modules: [],
      components: [],
      patterns: [],
      platform: 'capacitor',
      includeExamples: false
    };
    options.templateCatalog = await loadTemplateCatalog(options, cliRoot);

    try {
      const { targetDir } = await generateProject(options, cliRoot, workspace);
      expect(await fs.pathExists(path.join(targetDir, 'platforms', 'mobile-capacitor', 'capacitor.config.json'))).toBe(true);
    } finally {
      await fs.remove(workspace);
    }
  }, 20000);
});
