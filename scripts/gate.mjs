#!/usr/bin/env node
// Read-only repository gate. Never writes to the working tree.
// Usage: node scripts/gate.mjs [--root <dir>] [--json]
// Configuration lives in <root>/.qoder/gate.json.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const USAGE = `Usage: node scripts/gate.mjs [options]

Options:
  --root <dir>   repository root (default: current directory)
  --json         print machine-readable results
  -h, --help     show this help

Final line is always one of:
  GATE: clean
  GATE: warnings <n>
  GATE: errors <n>

Exit code: 0 when clean or warnings-only, 1 when any error is found.`;

const options = { root: process.cwd(), json: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--root') options.root = path.resolve(argv[(i += 1)]);
  else if (arg === '--json') options.json = true;
  else if (arg === '-h' || arg === '--help') {
    console.log(USAGE);
    process.exit(0);
  } else {
    console.error(`gate: unknown argument ${arg}`);
    process.exit(2);
  }
}

const root = options.root;
const configPath = path.join(root, '.qoder', 'gate.json');
if (!existsSync(configPath)) {
  console.error(`gate: missing ${path.relative(process.cwd(), configPath) || configPath}`);
  process.exit(2);
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`gate: invalid .qoder/gate.json: ${error.message}`);
  process.exit(2);
}

const label = config.label || path.basename(root);
const results = [];
const record = (level, check, message) => results.push({ level, check, message });

function trackedFiles() {
  try {
    const raw = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
    return raw.split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

const files = trackedFiles();
const fileSet = new Set(files);
for (const file of files) {
  let dir = path.posix.dirname(file);
  while (dir !== '.') {
    fileSet.add(dir);
    dir = path.posix.dirname(dir);
  }
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

// 1. Required files must exist and be non-empty.
let requiredProblems = 0;
for (const rel of config.requiredFiles || []) {
  const full = path.join(root, rel);
  if (!existsSync(full)) {
    record('fail', 'required-files', `missing ${rel}`);
    requiredProblems += 1;
  } else if (statSync(full).size === 0) {
    record('fail', 'required-files', `empty ${rel}`);
    requiredProblems += 1;
  }
}
if (!requiredProblems && config.requiredFiles?.length) {
  record('ok', 'required-files', `${config.requiredFiles.length} required files present`);
}

// 2. Declared JSON files must parse.
let jsonProblems = 0;
for (const rel of config.jsonFiles || []) {
  const full = path.join(root, rel);
  if (!existsSync(full)) {
    record('fail', 'json-validity', `missing ${rel}`);
    jsonProblems += 1;
    continue;
  }
  try {
    JSON.parse(readFileSync(full, 'utf8'));
  } catch (error) {
    record('fail', 'json-validity', `${rel}: ${error.message}`);
    jsonProblems += 1;
  }
}
if (!jsonProblems && config.jsonFiles?.length) {
  record('ok', 'json-validity', `${config.jsonFiles.length} JSON files parse`);
}

// 3. Delegate to the repository's own documentation checker when present.
if (config.readmeCheck) {
  const rel = config.readmeCheck;
  if (!existsSync(path.join(root, rel))) {
    record('fail', 'readme-check', `missing ${rel}`);
  } else {
    try {
      const out = execFileSync(process.execPath, [rel], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const last = out.trim().split('\n').filter(Boolean).pop();
      record('ok', 'readme-check', last || 'passed');
    } catch (error) {
      const text = `${error.stdout || ''}\n${error.stderr || ''}`.trim();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 5);
      record('fail', 'readme-check', lines.join(' | ') || 'checker exited non-zero');
    }
  }
}

// 4. Built-in local markdown link check (paths and same-file anchors).
if (config.markdownLinks) {
  const stripCode = text => text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '');
  const slug = text =>
    text.replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}_\s-]/gu, '').trim().toLowerCase().replace(/\s+/g, '-');
  const missing = [];
  for (const file of files.filter(item => /\.md$/i.test(item))) {
    const content = stripCode(readFileSync(path.join(root, file), 'utf8'));
    const anchors = new Set([...content.matchAll(/<a\s+id="([^"]+)"/g)].map(match => match[1]));
    for (const match of content.matchAll(/^#{1,6}\s+(.+)$/gm)) anchors.add(slug(match[1]));
    const links = [...content.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(m => m[1]);
    links.push(...[...content.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]));
    for (const link of links) {
      if (/^(?:https?:|mailto:|data:|tel:)/i.test(link)) continue;
      let target;
      let fragment;
      try {
        const [rawPath, rawFragment] = link.split('#');
        target = decodeURIComponent(rawPath.split('?')[0]);
        fragment = rawFragment ? decodeURIComponent(rawFragment) : '';
      } catch {
        missing.push(`${file}: invalid URL encoding: ${link}`);
        continue;
      }
      if (!target) {
        if (fragment && !anchors.has(fragment)) missing.push(`${file}: missing section: ${link}`);
        continue;
      }
      const resolved = path.posix
        .normalize(target.startsWith('/') ? target.slice(1) : path.posix.join(path.posix.dirname(file), target))
        .replace(/\/$/, '');
      if (resolved !== '.' && !fileSet.has(resolved)) missing.push(`${file}: missing path: ${link}`);
    }
  }
  for (const item of missing.slice(0, 10)) record('fail', 'markdown-links', item);
  if (missing.length > 10) record('fail', 'markdown-links', `${missing.length - 10} more`);
  if (!missing.length) record('ok', 'markdown-links', 'all local links resolve');
}

// 5. Files referenced from source under the public directory must exist.
if (config.publicDir && Array.isArray(config.scanDirs) && config.scanDirs.length) {
  const pattern = /["'`](\/[A-Za-z0-9._\-/]+\.(?:png|jpe?g|webp|svg|avif|ico|gif|mp4|webm|txt))["'`]/g;
  const missing = new Set();
  const scanned = files.filter(file => config.scanDirs.some(dir => file.startsWith(`${dir}/`)));
  for (const file of scanned) {
    const text = readFileSync(path.join(root, file), 'utf8');
    for (const match of text.matchAll(pattern)) {
      const ref = match[1];
      if (ref.startsWith('/__')) continue; // hosted asset service, not a local file
      const target = path.posix.join(config.publicDir, ref.slice(1));
      if (!existsSync(path.join(root, target))) missing.add(`${file}: ${ref}`);
    }
  }
  for (const item of [...missing].slice(0, 10)) record('fail', 'public-refs', item);
  if (missing.size > 10) record('fail', 'public-refs', `${missing.size - 10} more`);
  if (!missing.size) record('ok', 'public-refs', `${scanned.length} source files scanned`);
}

// 6. Declared package scripts must exist.
if (Array.isArray(config.requiredScripts) && config.requiredScripts.length) {
  const pkgPath = path.join(root, 'package.json');
  if (!existsSync(pkgPath)) {
    record('fail', 'package-scripts', 'missing package.json');
  } else {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const absent = config.requiredScripts.filter(name => !(pkg.scripts && pkg.scripts[name]));
      if (absent.length) record('fail', 'package-scripts', `missing scripts: ${absent.join(', ')}`);
      else record('ok', 'package-scripts', `${config.requiredScripts.length} scripts present`);
    } catch (error) {
      record('fail', 'package-scripts', error.message);
    }
  }
}

// 7. Oversized assets.
if (Array.isArray(config.assetDirs) && config.assetDirs.length) {
  const budget = Number(config.maxAssetKb || 0) * 1024;
  let largest = 0;
  let count = 0;
  const heavy = [];
  for (const dir of config.assetDirs) {
    for (const full of walk(path.join(root, dir))) {
      const size = statSync(full).size;
      count += 1;
      largest = Math.max(largest, size);
      if (budget && size > budget) {
        heavy.push(`${path.relative(root, full)} (${Math.round(size / 1024)} KB)`);
      }
    }
  }
  for (const item of heavy.slice(0, 10)) record('warn', 'asset-weight', `${item} over ${config.maxAssetKb} KB`);
  if (!heavy.length) record('ok', 'asset-weight', `${count} assets, largest ${Math.round(largest / 1024)} KB`);
}

// 8. Toolchain availability, when the profile expects local checks.
if (config.expectsNodeModules) {
  if (existsSync(path.join(root, 'node_modules'))) {
    record('ok', 'toolchain', 'node_modules present');
  } else {
    record('warn', 'toolchain', 'node_modules absent; eslint, vitest and build were not run');
  }
}

const errors = results.filter(item => item.level === 'fail').length;
const warnings = results.filter(item => item.level === 'warn').length;
const summary = errors
  ? `GATE: errors ${errors}`
  : warnings
    ? `GATE: warnings ${warnings}`
    : 'GATE: clean';

if (options.json) {
  console.log(JSON.stringify({ label, root, errors, warnings, summary, results }, null, 2));
} else {
  console.log(`gate [${label}] root=${root}`);
  for (const item of results) {
    const tag = item.level === 'fail' ? 'fail' : item.level === 'warn' ? 'warn' : 'ok  ';
    console.log(`${tag} ${item.check.padEnd(16)} ${item.message}`);
  }
  console.log(`gate: ${results.length} checks, ${warnings} warnings, ${errors} errors`);
}
console.log(summary);
if (errors) process.exitCode = 1;
