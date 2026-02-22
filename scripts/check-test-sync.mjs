#!/usr/bin/env node
import { execSync } from 'node:child_process';

const API_ROOTS = [
  'lib/features/',
  'lib/storage/',
  'lib/scheduler/',
  'lib/algorithms/',
  'utils/',
];

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function determineBaseHead() {
  const args = process.argv.slice(2);
  const baseArg = args.find((arg) => arg.startsWith('--base='));
  const headArg = args.find((arg) => arg.startsWith('--head='));

  const head = headArg ? headArg.split('=')[1] : 'HEAD';

  if (baseArg) {
    return { base: baseArg.split('=')[1], head };
  }

  try {
    run('git rev-parse --verify HEAD~1');
    return { base: 'HEAD~1', head };
  } catch {
    const emptyTree = run('git hash-object -t tree /dev/null');
    return { base: emptyTree, head };
  }
}

function isApiSourceFile(filePath) {
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return false;
  if (filePath.endsWith('/AGENTS.override.md')) return false;
  return API_ROOTS.some((root) => filePath.startsWith(root));
}

function hasExportDelta(base, head, filePath) {
  try {
    const patch = run(`git diff -U0 ${base} ${head} -- ${filePath}`);
    return patch
      .split('\n')
      .some((line) => /^\+/.test(line) && /\bexport\b/.test(line));
  } catch {
    return false;
  }
}

function main() {
  const { base, head } = determineBaseHead();
  const changedWithStatus = run(`git diff --name-status --diff-filter=ACMR ${base} ${head}`)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, filePath] = line.split(/\s+/, 2);
      return { status, filePath };
    });

  const changedFiles = changedWithStatus.map((entry) => entry.filePath);
  const hasTestChange = changedFiles.some((filePath) => filePath.startsWith('test/'));

  const apiCandidates = changedWithStatus.filter((entry) => isApiSourceFile(entry.filePath));

  const apiChangedFiles = apiCandidates
    .filter((entry) => entry.status === 'A' || hasExportDelta(base, head, entry.filePath))
    .map((entry) => entry.filePath);

  if (apiChangedFiles.length === 0) {
    console.log('Test-first check skipped: no API additions detected in this diff.');
    return;
  }

  if (!hasTestChange) {
    console.error('Test-first check failed: API additions were detected but no test/** changes were found.');
    for (const filePath of apiChangedFiles) {
      console.error(`- ${filePath}`);
    }
    process.exit(1);
  }

  console.log('Test-first check passed.');
}

main();
