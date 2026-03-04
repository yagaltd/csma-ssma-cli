import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';

function runCli(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn('node', ['/home/aurel/Documents/CSMA-SSMA/CLI/bin/csma-ssma.js', ...args], { cwd });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

describe('cli e2e smoke', () => {
  it('scaffolds project with --yes mode', async () => {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-e2e-'));
    const result = await runCli([
      '--yes',
      '--architecture', 'csma',
      '--project-name', 'smoke-app',
      '--template-source', 'local',
      '--csma-path', '/home/aurel/Documents/CSMA-SSMA/CSMA'
    ], workspace);

    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/Project created successfully/);
    expect(await fs.pathExists(path.join(workspace, 'smoke-app', 'src', 'main.js'))).toBe(true);

    await fs.remove(workspace);
  }, 30000);
});
