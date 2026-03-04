import path from 'node:path';
import fs from 'fs-extra';

export function assertSafeProjectName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Project name is required');
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error('Project name may only contain letters, numbers, dot, underscore, and hyphen');
  }
}

export async function ensureEmptyTargetDir(baseDir, projectName) {
  assertSafeProjectName(projectName);
  const targetDir = path.resolve(baseDir, projectName);
  await fs.ensureDir(targetDir);
  const files = await fs.readdir(targetDir);
  if (files.length > 0) {
    throw new Error(`Target directory is not empty: ${targetDir}`);
  }
  return targetDir;
}

export async function copyIfExists(src, dest) {
  if (await fs.pathExists(src)) {
    await fs.copy(src, dest);
  }
}
