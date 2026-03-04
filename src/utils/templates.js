import fs from 'fs-extra';
import path from 'node:path';
import { resolveTemplateRepos } from './sources.js';

const REQUIRED_KEYS = ['templateId', 'engine', 'runtime', 'version', 'schemaVersion', 'requiredFiles'];

function validateManifest(manifest, manifestPath) {
  for (const key of REQUIRED_KEYS) {
    if (!(key in manifest)) {
      throw new Error(`Manifest missing required key "${key}": ${manifestPath}`);
    }
  }
  if (!Array.isArray(manifest.requiredFiles) || manifest.requiredFiles.length === 0) {
    throw new Error(`Manifest requiredFiles must be a non-empty array: ${manifestPath}`);
  }
}

async function loadManifestsFromRepo(repoRoot) {
  const templatesRoot = path.join(repoRoot, 'templates');
  const entries = (await fs.readdir(templatesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const manifests = [];
  for (const entry of entries) {
    const manifestPath = path.join(templatesRoot, entry, 'template.manifest.json');
    if (!(await fs.pathExists(manifestPath))) {
      continue;
    }
    const manifest = await fs.readJson(manifestPath);
    validateManifest(manifest, manifestPath);
    manifests.push({ ...manifest, __templateDir: entry, __repoRoot: repoRoot });
  }
  return manifests;
}

function buildCsmaChoices(csmaManifest) {
  const optional = csmaManifest?.optionalFeatures || {};
  const toChoices = (items) => (Array.isArray(items) ? items.map((item) => ({ name: item, value: item })) : []);
  return {
    modules: toChoices(optional.modules),
    components: toChoices(optional.components),
    patterns: toChoices(optional.patterns),
    platforms: toChoices(optional.platforms || ['web'])
  };
}

export async function loadTemplateCatalog(options, rootDir) {
  const { csmaRoot, ssmaRoot } = await resolveTemplateRepos(options, rootDir);

  const csmaManifests = options.architecture === 'ssma' ? [] : await loadManifestsFromRepo(csmaRoot);
  const ssmaManifests = options.architecture === 'csma' ? [] : await loadManifestsFromRepo(ssmaRoot);

  const csmaBase = csmaManifests.find((manifest) => manifest.templateId === 'csma-base-web') || csmaManifests[0] || null;
  const ssmaRuntimes = ssmaManifests
    .filter((manifest) => manifest.engine === 'ssma')
    .map((manifest) => ({ name: `${manifest.runtime} (${manifest.templateId})`, value: manifest.runtime }));

  const csma = buildCsmaChoices(csmaBase);

  return {
    manifests: {
      csma: csmaManifests,
      ssma: ssmaManifests
    },
    architectures: [
      { name: 'CSMA only (frontend only)', value: 'csma' },
      { name: 'CSMA + SSMA (full stack)', value: 'csma-ssma' },
      { name: 'SSMA only (backend only)', value: 'ssma' }
    ],
    ssmaRuntimes,
    csma
  };
}

export function findManifestById(manifests, templateId) {
  return manifests.find((manifest) => manifest.templateId === templateId) || null;
}
