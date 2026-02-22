#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';

const MONITORED_ROOTS = [
  'lib/features/',
  'lib/storage/',
  'lib/scheduler/',
  'lib/algorithms/',
];

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function fileExistsInGit(filePath) {
  try {
    run(`git cat-file -e HEAD:${filePath}`);
    return true;
  } catch {
    return false;
  }
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

function isMonitoredCodeFile(filePath) {
  if (filePath.endsWith('/DESCRIPTION.md')) return false;
  if (filePath.endsWith('/AGENTS.override.md')) return false;
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return false;

  return MONITORED_ROOTS.some((root) => filePath.startsWith(root));
}

function descriptionPathFor(filePath) {
  const dir = path.posix.dirname(filePath);
  return `${dir}/DESCRIPTION.md`;
}

function main() {
  const { base, head } = determineBaseHead();
  const changedFiles = run(`git diff --name-only --diff-filter=ACMR ${base} ${head}`)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const changedSet = new Set(changedFiles);

  const violations = [];

  for (const filePath of changedFiles) {
    if (!isMonitoredCodeFile(filePath)) continue;

    const descriptionPath = descriptionPathFor(filePath);
    const hasDescription = fileExistsInGit(descriptionPath) || changedSet.has(descriptionPath);

    if (!hasDescription) {
      violations.push(`${filePath} -> missing ${descriptionPath}`);
      continue;
    }

    if (!changedSet.has(descriptionPath)) {
      violations.push(`${filePath} -> ${descriptionPath} not updated in the same diff`);
    }
  }

  if (violations.length > 0) {
    console.error('Document-first check failed:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Document-first check passed.');
}

main();
