#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCORE_FILE = path.resolve(process.cwd(), 'agent-score.json');
const BAR_WIDTH = 20;
const MAX_TOTAL_SCORE = 3000;

function pad(value, width) {
  const text = String(value);
  if (text.length >= width) {
    return text;
  }
  return `${text}${' '.repeat(width - text.length)}`;
}

function formatScore(value) {
  return Number.isFinite(value) ? value.toFixed(1) : 'N/A';
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function scoreBar(value) {
  const ratio = clamp(value / MAX_TOTAL_SCORE, 0, 1);
  const filled = Math.round(ratio * BAR_WIDTH);
  return `[${'#'.repeat(filled)}${'-'.repeat(BAR_WIDTH - filled)}]`;
}

function readScoreData() {
  if (!existsSync(SCORE_FILE)) {
    return null;
  }

  const raw = readFileSync(SCORE_FILE, 'utf8').trim();
  if (!raw) {
    return {};
  }

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('agent-score.json root must be an object.');
  }
  return parsed;
}

function toVersionRows(agentName, versions) {
  const rows = [];
  for (const [versionName, records] of Object.entries(versions)) {
    if (!Array.isArray(records) || records.length === 0) {
      continue;
    }

    const totals = records
      .map((item) => Number(item?.total_score))
      .filter((item) => Number.isFinite(item));

    if (totals.length === 0) {
      continue;
    }

    const last = totals[totals.length - 1];
    const sum = totals.reduce((acc, item) => acc + item, 0);
    const avg = sum / totals.length;
    const min = Math.min(...totals);
    const max = Math.max(...totals);

    rows.push({
      agent: agentName,
      version: versionName,
      count: totals.length,
      last,
      avg,
      min,
      max,
    });
  }
  return rows.sort((a, b) => b.last - a.last);
}

function printTable(rows) {
  const header =
    `${pad('Agent', 12)} ${pad('Version', 10)} ${pad('Count', 5)} ` +
    `${pad('Last', 7)} ${pad('Avg', 7)} ${pad('Min', 7)} ${pad('Max', 7)} Trend`;

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const row of rows) {
    const line =
      `${pad(row.agent, 12)} ${pad(row.version, 10)} ${pad(row.count, 5)} ` +
      `${pad(formatScore(row.last), 7)} ${pad(formatScore(row.avg), 7)} ` +
      `${pad(formatScore(row.min), 7)} ${pad(formatScore(row.max), 7)} ` +
      `${scoreBar(row.last)}`;
    console.log(line);
  }
}

function main() {
  const data = readScoreData();
  if (data === null) {
    console.log('agent-score.json not found.');
    return;
  }

  const rows = [];
  for (const [agentName, versions] of Object.entries(data)) {
    if (!versions || typeof versions !== 'object' || Array.isArray(versions)) {
      continue;
    }
    rows.push(...toVersionRows(agentName, versions));
  }

  if (rows.length === 0) {
    console.log('No score records found in agent-score.json.');
    return;
  }

  rows.sort((a, b) => b.last - a.last);
  console.log(`Agent Score Dashboard (${rows.length} version rows)`);
  console.log('');
  printTable(rows);
}

try {
  main();
} catch (error) {
  console.error(`[agent-list] ${error.message}`);
  process.exit(1);
}
