import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import { loadTemplateCatalog } from '../../src/utils/templates.js';
import { generateProject } from '../../src/generator.js';

const cliRoot = '/home/aurel/Documents/CSMA-SSMA/CLI';
const csmaRoot = '/home/aurel/Documents/CSMA-SSMA/CSMA';
const ssmaRoot = '/home/aurel/Documents/CSMA-SSMA/SSMA';

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
      includeExamples: false,
      agentConfig: 'none'
    };
    options.templateCatalog = await loadTemplateCatalog(options, cliRoot);

    try {
      const { targetDir } = await generateProject(options, cliRoot, workspace);
      expect(await fs.pathExists(path.join(targetDir, 'src', 'runtime', 'EventBus.js'))).toBe(true);
      expect(await fs.pathExists(path.join(targetDir, 'src', 'modules', 'router'))).toBe(true);
      expect(await fs.pathExists(path.join(targetDir, 'CLAUDE.md'))).toBe(false);
    } finally {
      await fs.remove(workspace);
    }
  }, 20000);

  it('copies CLAUDE.md and AGENTS.md from CLI root when requested', async () => {
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
      includeExamples: false,
      agentConfig: 'both'
    };
    options.templateCatalog = await loadTemplateCatalog(options, cliRoot);

    try {
      const { targetDir } = await generateProject(options, cliRoot, workspace);
      const generatedClaude = await fs.readFile(path.join(targetDir, 'CLAUDE.md'), 'utf8');
      const generatedAgents = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf8');
      const sourceClaude = await fs.readFile(path.join(cliRoot, 'CLAUDE.md'), 'utf8');
      const sourceAgents = await fs.readFile(path.join(cliRoot, 'AGENTS.md'), 'utf8');

      expect(generatedClaude).toBe(sourceClaude);
      expect(generatedAgents).toBe(sourceAgents);
    } finally {
      await fs.remove(workspace);
    }
  }, 20000);
});
