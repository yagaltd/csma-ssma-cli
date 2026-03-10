import path, { dirname } from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const cliBin = path.join(repoRoot, 'CLI', 'bin', 'csma-ssma.js');
const csmaRoot = path.join(repoRoot, 'CSMA');

function runCli(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn('node', [cliBin, ...args], { cwd });
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
      '--csma-path', csmaRoot
    ], workspace);

    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/Project created successfully/);
    expect(await fs.pathExists(path.join(workspace, 'smoke-app', 'src', 'main.js'))).toBe(true);
    expect(await fs.pathExists(path.join(workspace, 'smoke-app', 'AGENTS.md'))).toBe(true);

    await fs.remove(workspace);
  }, 30000);
});
