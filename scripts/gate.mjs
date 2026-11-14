#!/usr/bin/env node
/**
 * FlyGACA content gate — dependency-free.
 *
 * Six checks:
 *   1. disclaimer          EN + AR non-affiliation statement present
 *   2. gacar               no FAA numbering, no malformed §, no out-of-range parts
 *   3. bilingual           every Arabic document has an English counterpart
 *   4. register            repository tables carry an Owner column with a real owner
 *   5. links               local links and anchors resolve
 *   6. sources             source-verified dates exist and are fresh
 *
 * Usage:
 *   node scripts/gate.mjs [--config <file>] [--root <dir>] [--only a,b]
 *                        [--external] [--strict] [--format text|json|sarif]
 *                        [--out <file>]
 *
 * Exit codes: 0 clean, 1 findings (strict: warnings also fail), 2 usage/config error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CHECK_NAMES = ['disclaimer', 'gacar', 'bilingual', 'register', 'links', 'sources'];

const SKIP_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache', 'vendor', '.venv', 'venv',
]);

const CHECK_META = {
  disclaimer: 'Required non-affiliation statement in English and Arabic.',
  gacar: 'GACAR citation hygiene: no FAA/CFR numbering, malformed §, or out-of-range parts.',
  bilingual: 'Bilingual parity: Arabic documents have English counterparts.',
  register: 'Repository register: Repository rows carry an Owner column with a verified owner.',
  links: 'Links: relative paths and anchors resolve.',
  sources: 'Source freshness: source-verified dates exist and are recent.',
};

/* ------------------------------------------------------------------ helpers */

/** Convert a glob (`**`, `*`, `?`) to an anchored RegExp. */
export function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') {
          i++;
          out += '(?:[^/]+/)*';
        } else {
          out += '.*';
        }
      } else {
        out += '[^/]*';
      }
    } else if (c === '?') {
      out += '[^/]';
    } else if ('\\^$+.()|{}[]'.includes(c)) {
      out += '\\' + c;
    } else {
      out += c;
    }
  }
  return new RegExp('^' + out + '$');
}

/** GitHub-style heading slug, keeping Arabic letters. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-');
}

function walk(root) {
  const files = [];
  const rec = (dir, rel) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const nextRel = rel ? rel + '/' + e.name : e.name;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) rec(abs, nextRel);
      } else if (e.isFile()) {
        files.push(nextRel);
      }
    }
  };
  rec(root, '');
  return files;
}

export function matchFiles(root, include = ['**/*'], exclude = []) {
  const inc = (Array.isArray(include) ? include : [include]).map(globToRegExp);
  const exc = (Array.isArray(exclude) ? exclude : [exclude]).map(globToRegExp);
  return walk(root)
    .filter((f) => inc.some((re) => re.test(f)) && !exc.some((re) => re.test(f)))
    .sort();
}

function read(root, rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

/** Blank out fenced code blocks but keep line numbers stable. */
function stripFences(text) {
  let inFence = false;
  return text
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return '';
      }
      return inFence ? '' : line;
    })
    .join('\n');
}

function headings(text) {
  const out = [];
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (m) out.push(m[2]);
  }
  return out;
}

function anchorsOf(root, relFile, cache) {
  if (cache.has(relFile)) return cache.get(relFile);
  const set = new Set();
  const text = read(root, relFile);
  for (const h of headings(text)) {
    set.add(slugify(h));
    set.add(h.toLowerCase());
  }
  for (const m of text.matchAll(/<a\s+[^>]*(?:name|id)=["']([^"']+)["']/gi)) set.add(m[1].toLowerCase());
  for (const m of text.matchAll(/\bid=["']([^"']+)["']/gi)) set.add(m[1].toLowerCase());
  cache.set(relFile, set);
  return set;
}

function hasAnchor(root, relFile, anchor, cache) {
  let decoded;
  try {
    decoded = decodeURIComponent(anchor);
  } catch {
    decoded = anchor;
  }
  const want = decoded.toLowerCase();
  const set = anchorsOf(root, relFile, cache);
  if (set.has(want)) return true;
  return Array.from(set).some((s) => s.replace(/-\d+$/, '') === want);
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}

function parseTables(lines) {
  const tables = [];
  const delim = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].includes('|')) continue;
    if (!delim.test(lines[i + 1])) continue;
    const headers = splitRow(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length; j++) {
      const l = lines[j];
      if (l.trim() === '' || !l.includes('|')) break;
      rows.push({ cells: splitRow(l), line: j + 1 });
    }
    tables.push({ headers, rows });
    i = j;
  }
  return tables;
}

function headerIndex(headers, name) {
  const want = name.replace(/[`*_]/g, '').trim().toLowerCase();
  return headers.findIndex((h) => h.replace(/[`*_]/g, '').trim().toLowerCase() === want);
}

/* ------------------------------------------------------------------- checks */

function checkDisclaimer(ctx) {
  const d = ctx.config.disclaimer || {};
  const patterns = d.files && d.files.length ? d.files : ['README.md'];
  const files = matchFiles(ctx.root, patterns);
  if (files.length === 0) {
    ctx.add('warning', 'disclaimer', `no disclaimer file matched: ${patterns.join(', ')}`);
    return;
  }
  for (const file of files) {
    const text = read(ctx.root, file);
    if (d.english && !new RegExp(d.english, 'i').test(text)) {
      ctx.add('warning', 'disclaimer', 'missing non-affiliation statement (English)', file);
    }
    if (d.arabic && !new RegExp(d.arabic).test(text)) {
      ctx.add('warning', 'disclaimer', 'missing non-affiliation statement (Arabic)', file);
    }
  }
}

function checkGacar(ctx) {
  const g = ctx.config.gacar || {};
  const maxPart = Number.isInteger(g.maxPart) ? g.maxPart : 199;
  const files = matchFiles(ctx.root, g.include || ['**/*.md'], g.exclude);
  const faa = [
    { re: /\b14\s*CFR\b/gi, label: '14 CFR' },
    { re: /\bFAR\b/g, label: 'FAR' },
    { re: /\bFAA\s+Part\b/gi, label: 'FAA Part' },
    { re: /\bFAA\s+regulations?\b/gi, label: 'FAA regulations' },
  ];
  for (const file of files) {
    const lines = stripFences(read(ctx.root, file)).split(/\r?\n/);
    lines.forEach((raw, idx) => {
      // Ignore inline-code examples such as `14 CFR` or `§91` in policy docs.
      const line = raw.replace(/`[^`]*`/g, '');
      for (const p of faa) {
        p.re.lastIndex = 0;
        if (p.re.test(line)) {
          ctx.add('error', 'gacar', `${p.label} is FAA numbering; cite GACAR § part.section instead`, file, idx + 1);
        }
      }
      // Malformed section signs matter only where the line cites GACAR; other
      // § uses (for example internal "§1 to §5" references) are not citations.
      if (/GACAR|gacar|regulation/i.test(line)) {
        const bad = line.match(/§{2,}|§(?![ \u00A0])|§[ \u00A0]*\d+(?:\.\d+){2,}/);
        if (bad) {
          const snippet = line.trim().slice(0, 100);
          ctx.add('error', 'gacar', `malformed § citation ("${snippet}"); expected "GACAR § 91.3"`, file, idx + 1);
        }
      }
      for (const re of [/GACAR\s+Part\s+(\d+)/gi, /GACAR\s+§\s*(\d+)(?:[.\s,;)]|$)/gi]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          const part = Number(m[1]);
          if (part > maxPart || part < 1) {
            ctx.add('error', 'gacar', `GACAR Part ${part} is out of range (1–${maxPart})`, file, idx + 1);
          }
        }
      }
    });
  }
}

function checkBilingual(ctx) {
  const b = ctx.config.bilingual || {};
  const files = matchFiles(ctx.root, b.arabic || ['**/*_AR.md']);
  for (const file of files) {
    const base = path.posix.basename(file);
    const english = base.replace(/_AR\.md$/i, '.md');
    if (english === base) {
      ctx.add('warning', 'bilingual', 'Arabic file name does not follow *_AR.md; cannot derive counterpart', file);
      continue;
    }
    const dir = path.posix.dirname(file);
    const counterpart = dir === '.' ? english : `${dir}/${english}`;
    if (!fs.existsSync(path.join(ctx.root, counterpart))) {
      ctx.add('warning', 'bilingual', `Arabic-only: no English counterpart (${counterpart})`, file);
    }
  }
}

function checkRegister(ctx) {
  const r = ctx.config.register || {};
  const files = matchFiles(ctx.root, r.files || ['README.md', 'REPOSITORIES.md']);
  const required = Array.isArray(r.requiredColumns) && r.requiredColumns.length
    ? r.requiredColumns
    : ['Repository', 'Owner'];
  const repoCol = required[0];
  const ownerCol = required[1];
  for (const file of files) {
    const lines = stripFences(read(ctx.root, file)).split(/\r?\n/);
    for (const table of parseTables(lines)) {
      const repoIdx = headerIndex(table.headers, repoCol);
      if (repoIdx === -1) continue;
      const ownerIdx = headerIndex(table.headers, ownerCol);
      for (const row of table.rows) {
        const name = (row.cells[repoIdx] || '').replace(/[`*]/g, '').trim() || '(unnamed row)';
        if (ownerIdx === -1) {
          ctx.add('warning', 'register', `repository "${name}" has no Owner column — Owner unverified`, file, row.line);
        } else {
          const owner = (row.cells[ownerIdx] || '').trim();
          if (!owner || /^(unverified|tbd|todo|\?|n\/a|none)$/i.test(owner)) {
            ctx.add('warning', 'register', `repository "${name}": Owner ${owner || 'empty'} — unverified`, file, row.line);
          }
        }
      }
    }
  }
}

function checkLinks(ctx) {
  const l = ctx.config.links || {};
  const files = matchFiles(ctx.root, l.include || ['**/*.md'], l.exclude);
  const cache = new Map();
  const external = new Set();
  const linkRe = /!?\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

  for (const file of files) {
    const lines = stripFences(read(ctx.root, file)).split(/\r?\n/);
    lines.forEach((raw, idx) => {
      const line = raw.replace(/`[^`]*`/g, '');
      linkRe.lastIndex = 0;
      let m;
      while ((m = linkRe.exec(line)) !== null) {
        let target = m[1].replace(/^<|>$/g, '');
        if (!target) continue;

        if (/^(https?:)?\/\//i.test(target)) {
          if (ctx.external) external.add(target);
          continue;
        }
        if (/^(mailto:|tel:|data:|javascript:)/i.test(target)) continue;

        const hashAt = target.indexOf('#');
        const filePartRaw = hashAt >= 0 ? target.slice(0, hashAt) : target;
        const anchorRaw = hashAt >= 0 ? target.slice(hashAt + 1) : '';

        if (!filePartRaw) {
          if (anchorRaw && !hasAnchor(ctx.root, file, anchorRaw, cache)) {
            ctx.add('error', 'links', `broken anchor #${anchorRaw} in this file`, file, idx + 1);
          }
          continue;
        }

        let filePart;
        try {
          filePart = decodeURIComponent(filePartRaw.split('?')[0]);
        } catch {
          filePart = filePartRaw.split('?')[0];
        }
        if (/^[a-z][a-z0-9+.-]*:/i.test(filePart)) continue;

        const dir = path.posix.dirname(file);
        const resolved = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, filePart));
        const abs = path.join(ctx.root, resolved);
        if (!fs.existsSync(abs)) {
          ctx.add('error', 'links', `broken link: ${filePart} does not exist`, file, idx + 1);
          continue;
        }
        if (anchorRaw && fs.statSync(abs).isFile() && !hasAnchor(ctx.root, resolved, anchorRaw, cache)) {
          ctx.add('error', 'links', `broken anchor ${filePart}#${anchorRaw}`, file, idx + 1);
        }
      }
    });
  }
  return Array.from(external);
}

async function checkExternalLinks(ctx, urls) {
  if (urls.length === 0) return;
  const l = ctx.config.links || {};
  const max = Number.isInteger(l.maxExternal) ? l.maxExternal : 25;
  const timeoutMs = Number.isInteger(l.timeoutMs) ? l.timeoutMs : 8000;
  for (const url of urls.slice(0, max)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'flygaca-content-gate/1.0' },
      });
      if (res.status >= 400) {
        ctx.add('warning', 'links', `external link HTTP ${res.status}: ${url}`);
      }
    } catch (err) {
      ctx.add('warning', 'links', `external link unreachable: ${url} (${err.name})`);
    } finally {
      clearTimeout(timer);
    }
  }
}

function checkSources(ctx) {
  const s = ctx.config.sources || {};
  const maxAge = Number.isInteger(s.maxAgeDays) ? s.maxAgeDays : 180;
  const files = matchFiles(ctx.root, s.include || ['**/*.md'], s.exclude);
  const required = Array.isArray(s.required) && s.required.length
    ? new Set(matchFiles(ctx.root, s.required))
    : new Set();
  const marker = /(?:source-verified|source_verified|last-verified)\s*[:\-]\s*(\d{4}-\d{2}-\d{2})/gi;

  for (const file of files) {
    const lines = stripFences(read(ctx.root, file)).split(/\r?\n/);
    let found = 0;
    lines.forEach((line, idx) => {
      marker.lastIndex = 0;
      let m;
      while ((m = marker.exec(line)) !== null) {
        found++;
        const when = Date.parse(m[1] + 'T00:00:00Z');
        if (Number.isNaN(when)) {
          ctx.add('warning', 'sources', `invalid source-verified date: ${m[1]}`, file, idx + 1);
          continue;
        }
        const age = Math.floor((ctx.now.getTime() - when) / 86400000);
        if (age > maxAge) {
          ctx.add('error', 'sources', `source verification stale: ${m[1]} is ${age} days old (limit ${maxAge})`, file, idx + 1);
        }
      }
    });
    if (required.has(file) && found === 0) {
      ctx.add('warning', 'sources', 'no source-verified date (required for this file)', file);
    }
  }
}

/* --------------------------------------------------------------------- core */

export function loadConfig(root, configPath) {
  const candidates = [];
  if (configPath) {
    candidates.push(path.isAbsolute(configPath) ? configPath : path.resolve(root, configPath));
  } else {
    candidates.push(
      path.join(root, 'scripts', 'gate.config.json'),
      path.join(root, '.qoder', 'gate.config.json'),
    );
  }
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return JSON.parse(fs.readFileSync(candidate, 'utf8'));
  }
  throw new Error(
    `No gate config found. Looked for: ${candidates.join(', ')}. ` +
      'Run ./install.sh <repo> --config <name> or pass --config <file>.',
  );
}

/**
 * Run the gate.
 * @param {{root?: string, config?: object|string, now?: Date, external?: boolean, only?: string[]|string}} options
 */
export async function runGate(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  let config = options.config;
  if (!config || typeof config === 'string') {
    config = loadConfig(root, typeof config === 'string' ? config : undefined);
  }
  const now = options.now instanceof Date ? options.now : new Date();
  const external = Boolean(options.external);
  const only = options.only
    ? (Array.isArray(options.only) ? options.only : String(options.only).split(',')).map((s) => s.trim()).filter(Boolean)
    : null;

  const findings = [];
  const add = (severity, check, message, file, line) => {
    const finding = { severity, check, message };
    if (file) finding.file = file;
    if (Number.isInteger(line)) finding.line = line;
    findings.push(finding);
  };
  const ctx = { root, config, now, external, add };
  const enabled = (name) => !only || only.includes(name);

  if (enabled('disclaimer') && config.disclaimer) checkDisclaimer(ctx);
  if (enabled('gacar') && config.gacar) checkGacar(ctx);
  if (enabled('bilingual') && config.bilingual) checkBilingual(ctx);
  if (enabled('register') && config.register) checkRegister(ctx);
  let externalUrls = [];
  if (enabled('links') && config.links) {
    externalUrls = checkLinks(ctx);
    if (external) await checkExternalLinks(ctx, externalUrls);
  }
  if (enabled('sources') && config.sources) checkSources(ctx);

  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warning');
  return { config: config.name || '(unnamed)', errors, warnings, findings };
}

/* ------------------------------------------------------------------ output */

export function formatText(result) {
  const lines = [];
  lines.push(`Content gate: ${result.config}`);
  lines.push(`${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
  if (result.findings.length === 0) {
    lines.push('All checks passed.');
    return lines.join('\n');
  }
  lines.push('');
  for (const f of result.findings) {
    const loc = f.file ? ` ${f.file}${f.line ? ':' + f.line : ''}` : '';
    lines.push(`${f.severity === 'error' ? 'ERROR' : 'WARN '} [${f.check}]${loc} — ${f.message}`);
  }
  return lines.join('\n');
}

export function formatSarif(result) {
  const rules = CHECK_NAMES.map((id) => ({
    id,
    name: id,
    shortDescription: { text: CHECK_META[id] },
  }));
  const results = result.findings.map((f) => {
    const item = {
      ruleId: f.check,
      level: f.severity === 'error' ? 'error' : 'warning',
      message: { text: f.message },
    };
    if (f.file) {
      item.locations = [
        {
          physicalLocation: {
            artifactLocation: { uri: f.file },
            region: { startLine: f.line || 1 },
          },
        },
      ];
    }
    return item;
  });
  return JSON.stringify(
    {
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'flygaca-content-gate',
              informationUri: 'https://flygaca.com',
              version: '1.0.0',
              rules,
            },
          },
          results,
        },
      ],
    },
    null,
    2,
  );
}

/* --------------------------------------------------------------------- CLI */

function parseArgs(argv) {
  const args = {
    config: undefined,
    root: undefined,
    format: 'text',
    out: undefined,
    strict: false,
    external: false,
    only: undefined,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    let inline;
    if (a.startsWith('--') && a.includes('=')) {
      inline = a.slice(a.indexOf('=') + 1);
      a = a.slice(0, a.indexOf('='));
    }
    const take = () => {
      if (inline !== undefined) return inline;
      const v = argv[++i];
      if (v === undefined) throw new Error(`Missing value for ${a}`);
      return v;
    };
    switch (a) {
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '--config':
        args.config = take();
        break;
      case '--root':
        args.root = take();
        break;
      case '--format':
        args.format = take();
        break;
      case '--out':
        args.out = take();
        break;
      case '--only':
        args.only = take().split(',').map((s) => s.trim()).filter(Boolean);
        break;
      case '--strict':
        args.strict = true;
        break;
      case '--external':
        args.external = true;
        break;
      default:
        throw new Error(`Unknown option: ${a}`);
    }
  }
  return args;
}

function usage() {
  return [
    'Usage: node scripts/gate.mjs [options]',
    '',
    'Options:',
    '  --config <file>    Gate config (default: scripts/gate.config.json)',
    '  --root <dir>       Repository root (default: cwd)',
    '  --only <a,b>       Run only the named checks',
    '  --external         Also fetch external http(s) links',
    '  --strict           Exit 1 on warnings as well as errors',
    '  --format <fmt>     text | json | sarif (default: text)',
    '  --out <file>       Write the report to a file',
    '  -h, --help         Show this help',
    '',
    `Checks: ${CHECK_NAMES.join(', ')}`,
  ].join('\n');
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    console.error(usage());
    process.exitCode = 2;
    return;
  }
  if (args.help) {
    process.stdout.write(usage() + '\n');
    return;
  }
  if (!['text', 'json', 'sarif'].includes(args.format)) {
    console.error(`Unknown format: ${args.format}`);
    process.exitCode = 2;
    return;
  }

  const root = path.resolve(args.root || process.cwd());
  let config;
  try {
    config = loadConfig(root, args.config);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 2;
    return;
  }

  const result = await runGate({
    root,
    config,
    external: args.external,
    only: args.only,
  });

  const output =
    args.format === 'sarif'
      ? formatSarif(result)
      : args.format === 'json'
        ? JSON.stringify(result, null, 2)
        : formatText(result);

  if (args.out) {
    fs.writeFileSync(path.resolve(args.out), output + '\n');
    if (args.format !== 'text') process.stdout.write(`Wrote ${args.format} report to ${args.out}\n`);
    else process.stdout.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }

  if (result.errors.length > 0) process.exitCode = 1;
  else if (args.strict && result.warnings.length > 0) process.exitCode = 1;
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 2;
  });
}
