import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import fs from 'fs-extra';

function normalizeLocalPath(inputPath, fallback) {
  return inputPath ? path.resolve(inputPath) : path.resolve(fallback);
}

async function assertTemplateRepo(repoPath, repoName) {
  const templatesPath = path.join(repoPath, 'templates');
  if (!(await fs.pathExists(repoPath))) {
    throw new Error(`${repoName} path does not exist: ${repoPath}`);
  }
  if (!(await fs.pathExists(templatesPath))) {
    throw new Error(`${repoName} does not contain templates/: ${repoPath}`);
  }
}

function normalizeRepoSlug(repo) {
  if (!repo) return null;
  return repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
}

function safeCacheKey(repoSlug, ref) {
  return `${repoSlug}@${ref}`.replace(/[^a-zA-Z0-9._@-]/g, '_');
}

async function cloneGithubRepo(repoSlug, ref, cacheRoot) {
  const cacheKey = safeCacheKey(repoSlug, ref);
  const dest = path.join(cacheRoot, cacheKey);

  if (await fs.pathExists(path.join(dest, 'templates'))) {
    return dest;
  }

  await fs.remove(dest);
  await fs.ensureDir(cacheRoot);

  const repoUrl = `https://github.com/${repoSlug}.git`;
  try {
    execFileSync('git', ['clone', '--depth', '1', '--branch', ref, repoUrl, dest], {
      stdio: 'pipe'
    });
  } catch (error) {
    const stderr = error?.stderr?.toString?.() || error?.message || 'unknown git error';
    throw new Error(`Failed to clone ${repoSlug}@${ref}: ${stderr.trim()}`);
  }

  return dest;
}

export async function resolveTemplateRepos(options, rootDir) {
  const source = options.templateSource || 'local';
  const templateRef = options.templateRef || 'main';

  if (source === 'github') {
    const csmaRepo = normalizeRepoSlug(options.csmaRepo || process.env.CSMA_REPO);
    const ssmaRepo = normalizeRepoSlug(options.ssmaRepo || process.env.SSMA_REPO);
    const cacheRoot = path.join(os.tmpdir(), 'csma-ssma-cli-repos');

    if (options.architecture !== 'ssma' && !csmaRepo) {
      throw new Error('Missing CSMA repo for github source. Provide --csma-repo <owner/repo> or CSMA_REPO env.');
    }
    if (options.architecture !== 'csma' && !ssmaRepo) {
      throw new Error('Missing SSMA repo for github source. Provide --ssma-repo <owner/repo> or SSMA_REPO env.');
    }

    const csmaRoot = options.architecture === 'ssma'
      ? null
      : await cloneGithubRepo(csmaRepo, templateRef, cacheRoot);
    const ssmaRoot = options.architecture === 'csma'
      ? null
      : await cloneGithubRepo(ssmaRepo, templateRef, cacheRoot);

    if (options.architecture !== 'ssma') {
      await assertTemplateRepo(csmaRoot, 'CSMA');
    }
    if (options.architecture !== 'csma') {
      await assertTemplateRepo(ssmaRoot, 'SSMA');
    }

    return {
      csmaRoot,
      ssmaRoot,
      modeMeta: {
        source,
        templateRef,
        csmaRepo: csmaRepo || null,
        ssmaRepo: ssmaRepo || null
      }
    };
  }

  const csmaRoot = normalizeLocalPath(
    options.csmaPath || process.env.CSMA_PATH,
    path.join(rootDir, '..', '..', 'CSMA')
  );
  const ssmaRoot = normalizeLocalPath(
    options.ssmaPath || process.env.SSMA_PATH,
    path.join(rootDir, '..', '..', 'SSMA')
  );

  if (options.architecture !== 'ssma') {
    await assertTemplateRepo(csmaRoot, 'CSMA');
  }
  if (options.architecture !== 'csma') {
    await assertTemplateRepo(ssmaRoot, 'SSMA');
  }

  return {
    csmaRoot,
    ssmaRoot,
    modeMeta: {
      source,
      templateRef: options.templateRef || null
    }
  };
}
