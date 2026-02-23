#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const MAX_SCORE = 1000;
const MAX_RETRIES = 3;
const WEIGHTS = {
  security: { must_fix: 200, should_fix: 50 },
  code_quality: { must_fix: 20, should_fix: 10 },
  architecture: { must_fix: 100, should_fix: 50 },
};

function readStdin() {
  return readFileSync(0, 'utf8').trim();
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeFenceMatch) {
      return JSON.parse(codeFenceMatch[1]);
    }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('No JSON object found in codex output.');
  }
}

function assertCount(value, fieldName) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid count field: ${fieldName}`);
  }
}

function validateQuantizedResult(result) {
  const categories = ['security', 'code_quality', 'architecture'];
  for (const category of categories) {
    if (!result || typeof result !== 'object' || !result[category]) {
      throw new Error(`Missing category: ${category}`);
    }
    const mustFix = result[category].must_fix;
    const shouldFix = result[category].should_fix;
    assertCount(mustFix, `${category}.must_fix`);
    assertCount(shouldFix, `${category}.should_fix`);
  }
}

function scoreCategory(counts, weights) {
  const rawScore = MAX_SCORE - counts.must_fix * weights.must_fix - counts.should_fix * weights.should_fix;
  return Math.max(0, rawScore);
}

function buildPrompt({ reviewOutput, agent, version, branch, commitId, retryHint }) {
  return `
你需要把下面的审计结果量化成 JSON。只能输出 JSON 对象，不能输出任何解释、注释、markdown。

上下文信息：
- agent: ${agent}
- version: ${version}
- branch: ${branch}
- commit_id: ${commitId}

审计结果文本（MUST_FIX / SHOULD_FIX）：
${reviewOutput}

任务：
1. 按问题内容将每条问题分类到以下三类之一：security / code_quality / architecture。
2. 分别统计三类中的 must_fix 和 should_fix 数量。
3. 输出格式严格为：
{
  "security": { "must_fix": number, "should_fix": number },
  "code_quality": { "must_fix": number, "should_fix": number },
  "architecture": { "must_fix": number, "should_fix": number }
}
4. 若文本是 MUST_FIX: (none)，则所有计数为 0。
5. 所有数值必须是非负整数。

${retryHint}
`.trim();
}

function quantizeWithRetry(context) {
  let retryHint = '';
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const prompt = buildPrompt({ ...context, retryHint });
      const output = execFileSync('npx', ['codex', 'exec', '-'], {
        input: prompt,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      });
      const parsed = extractJsonObject(output);
      validateQuantizedResult(parsed);
      return parsed;
    } catch (error) {
      lastError = error;
      retryHint = '请重新生成json';
    }
  }

  throw lastError ?? new Error('Failed to get a valid JSON result from codex.');
}

function ensureObject(value, filePath) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid JSON root in ${filePath}: expected object.`);
  }
}

function appendScoreRecord({ repoRoot, agent, version, record }) {
  const scoreFilePath = path.join(repoRoot, 'agent-score.json');
  let root = {};

  if (existsSync(scoreFilePath)) {
    const raw = readFileSync(scoreFilePath, 'utf8').trim();
    if (raw.length > 0) {
      root = JSON.parse(raw);
      ensureObject(root, scoreFilePath);
    }
  }

  if (!root[agent]) {
    root[agent] = {};
  }
  if (!root[agent][version]) {
    root[agent][version] = [];
  }
  if (!Array.isArray(root[agent][version])) {
    throw new Error(`Invalid path in agent-score.json: ${agent}.${version} must be an array.`);
  }

  root[agent][version].push(record);
  writeFileSync(scoreFilePath, `${JSON.stringify(root, null, 2)}\n`, 'utf8');
}

function main() {
  const reviewOutput = readStdin();
  if (!reviewOutput) {
    throw new Error('No review output received from stdin.');
  }

  const repoRoot = runGit(['rev-parse', '--show-toplevel']);
  const branch = runGit(['branch', '--show-current']);
  const commitId = runGit(['rev-parse', 'HEAD']);
  const branchMatch = branch.match(/^agents\/([^/]+)\/([^/]+)\/.+$/);
  if (!branchMatch) {
    throw new Error(`Current branch "${branch}" does not match agents/<agent>/<version>/<task>.`);
  }

  const agent = branchMatch[1];
  const version = branchMatch[2];
  const quantized = quantizeWithRetry({ reviewOutput, agent, version, branch, commitId });

  const securityScore = scoreCategory(quantized.security, WEIGHTS.security);
  const codeQualityScore = scoreCategory(quantized.code_quality, WEIGHTS.code_quality);
  const architectureScore = scoreCategory(quantized.architecture, WEIGHTS.architecture);
  const totalScore = securityScore + codeQualityScore + architectureScore;

  const record = {
    agent,
    version,
    branch,
    commit_id: commitId,
    security_score: securityScore,
    code_quality_score: codeQualityScore,
    architecture_score: architectureScore,
    total_score: totalScore,
  };

  appendScoreRecord({ repoRoot, agent, version, record });
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`[agent-score] ${error.message}\n`);
  process.exit(1);
}
