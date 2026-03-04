import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import { resolveTemplateRepos } from '../../src/utils/sources.js';

async function makeRepo(name) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `cli-${name}-`));
  await fs.ensureDir(path.join(dir, 'templates'));
  return dir;
}

describe('resolveTemplateRepos', () => {
  it('resolves local repos from explicit paths', async () => {
    const csma = await makeRepo('csma');
    const ssma = await makeRepo('ssma');

    const result = await resolveTemplateRepos(
      {
        templateSource: 'local',
        architecture: 'csma-ssma',
        csmaPath: csma,
        ssmaPath: ssma
      },
      '/tmp/cli'
    );

    expect(result.csmaRoot).toBe(csma);
    expect(result.ssmaRoot).toBe(ssma);
  });

  it('throws for github source in MVP', async () => {
    await expect(
      resolveTemplateRepos(
        { templateSource: 'github', architecture: 'csma' },
        '/tmp/cli'
      )
    ).rejects.toThrow(/not yet enabled/);
  });
});
