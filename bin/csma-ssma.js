#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runCli } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

runCli(rootDir).catch((error) => {
  console.error('[csma-ssma] fatal:', error.message);
  process.exit(1);
});
