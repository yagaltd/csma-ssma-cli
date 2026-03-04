import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import { loadTemplateCatalog } from '../../src/utils/templates.js';

async function createManifestRepo(prefix, manifest) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  const templateDir = path.join(dir, 'templates', 'base');
  await fs.ensureDir(templateDir);
  await fs.writeJson(path.join(templateDir, 'template.manifest.json'), manifest, { spaces: 2 });
  return dir;
}

describe('loadTemplateCatalog', () => {
  it('loads manifests and builds choice lists', async () => {
    const csma = await createManifestRepo('cli-csma-', {
      templateId: 'csma-base-web',
      engine: 'csma',
      runtime: 'web',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      requiredFiles: ['README.md'],
      optionalFeatures: {
        modules: ['router'],
        components: ['button'],
        patterns: ['sidebar'],
        platforms: ['web']
      }
    });
    await fs.writeFile(path.join(csma, 'README.md'), 'x');

    const ssma = await createManifestRepo('cli-ssma-', {
      templateId: 'ssma-js-gateway',
      engine: 'ssma',
      runtime: 'js',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      requiredFiles: ['README.md']
    });
    await fs.writeFile(path.join(ssma, 'README.md'), 'x');

    const catalog = await loadTemplateCatalog(
      {
        templateSource: 'local',
        architecture: 'csma-ssma',
        csmaPath: csma,
        ssmaPath: ssma
      },
      '/tmp/cli'
    );

    expect(catalog.csma.modules[0].value).toBe('router');
    expect(catalog.ssmaRuntimes[0].value).toBe('js');
  });
});
