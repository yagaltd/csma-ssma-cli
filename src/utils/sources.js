import path from 'node:path';
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

export async function resolveTemplateRepos(options, rootDir) {
  const source = options.templateSource || 'local';

  if (source === 'github') {
    throw new Error('GitHub template source is not yet enabled for live fetch in this MVP. Use --template-source local.');
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
