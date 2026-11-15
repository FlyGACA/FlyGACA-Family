import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runGate } from '../scripts/gate.mjs';

const NOW = new Date('2026-11-14T00:00:00Z');

// Upper bound of the published GACAR index: AGENTS.md policy 2 and
// .qoder/rules/10-gacar-citations.mdc both say "any part outside 1-199" is
// wrong, with Parts 175, 179, 183 and 193 named as existing. The tests and
// scripts/gate.config.json must agree on the same number; a test below checks.
const MAX_PART = 199;

const shippedConfig = JSON.parse(
  fs.readFileSync(new URL('../scripts/gate.config.json', import.meta.url), 'utf8'),
);

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flygaca-gate-'));
  return {
    root,
    write(rel, content) {
      const abs = path.join(root, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
    },
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

test('disclaimer: flags a missing Arabic non-affiliation statement', async () => {
  const f = fixture();
  try {
    f.write('README.md', '# App\n\nWe are not affiliated with GACA.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['disclaimer'],
      config: {
        disclaimer: {
          files: ['README.md'],
          english: 'not affiliated with',
          arabic: 'غير\\s+تابع|لا\\s+تتبع|غير\\s+مرتبط',
        },
      },
    });
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 1);
    assert.equal(result.warnings[0].check, 'disclaimer');
    assert.match(result.warnings[0].message, /Arabic/);
  } finally {
    f.cleanup();
  }
});

test('gacar: rejects FAA/CFR numbering', async () => {
  const f = fixture();
  try {
    f.write('guide.md', '# Guide\n\nSee 14 CFR Part 91 for the rule.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['gacar'],
      config: { gacar: { include: ['**/*.md'], maxPart: MAX_PART } },
    });
    assert.equal(result.warnings.length, 0);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].check, 'gacar');
    assert.match(result.errors[0].message, /14 CFR/);
    assert.equal(result.errors[0].line, 3);
  } finally {
    f.cleanup();
  }
});

test('gacar: rejects a malformed section sign', async () => {
  const f = fixture();
  try {
    f.write('guide.md', '# Guide\n\nRefer to GACAR §91 for the rule.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['gacar'],
      config: { gacar: { include: ['**/*.md'], maxPart: MAX_PART } },
    });
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0].message, /malformed §/);
  } finally {
    f.cleanup();
  }
});

test('gacar: rejects a GACAR part outside the published range', async () => {
  const f = fixture();
  try {
    f.write('guide.md', '# Guide\n\nGACAR Part 999 applies to this aircraft.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['gacar'],
      config: { gacar: { include: ['**/*.md'], maxPart: MAX_PART } },
    });
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0].message, /Part 999 is out of range/);
  } finally {
    f.cleanup();
  }
});

test('bilingual: flags an Arabic-only document', async () => {
  const f = fixture();
  try {
    f.write('phases/03_education/README_AR.md', '# المرحلة\n\nمحتوى عربي فقط.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['bilingual'],
      config: { bilingual: { arabic: ['**/README_AR.md'], requireCounterparts: true } },
    });
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0].message, /no English counterpart/);
    assert.match(result.warnings[0].file, /README_AR\.md$/);
  } finally {
    f.cleanup();
  }
});

test('register: flags repository rows with no Owner column', async () => {
  const f = fixture();
  try {
    f.write(
      'REPOSITORIES.md',
      [
        '# Repositories',
        '',
        '| Repository | What it covers |',
        '| --- | --- |',
        '| FlyGACA web | Regulatory reference |',
        '| C172 | Study phases |',
        '',
      ].join('\n'),
    );
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['register'],
      config: {
        register: {
          files: ['REPOSITORIES.md'],
          requiredColumns: ['Repository', 'Owner'],
        },
      },
    });
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 2);
    assert.ok(result.warnings.every((w) => /Owner unverified/.test(w.message)));
  } finally {
    f.cleanup();
  }
});

test('links: flags a broken cross-file anchor', async () => {
  const f = fixture();
  try {
    f.write('guide.md', '# Guide\n\n[Setup](other.md#setup-guide)\n');
    f.write('other.md', '# Other\n\nNo such heading here.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['links'],
      config: { links: { include: ['**/*.md'] } },
    });
    assert.equal(result.warnings.length, 0);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].check, 'links');
    assert.match(result.errors[0].message, /broken anchor other\.md#setup-guide/);
  } finally {
    f.cleanup();
  }
});

test('sources: flags a stale source-verified date', async () => {
  const f = fixture();
  try {
    f.write('doc.md', '# Doc\n\nsource-verified: 2020-01-01\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['sources'],
      config: { sources: { include: ['**/*.md'], maxAgeDays: 180 } },
    });
    assert.equal(result.warnings.length, 0);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].check, 'sources');
    assert.match(result.errors[0].message, /stale/);
    assert.match(result.errors[0].message, /2020-01-01/);
  } finally {
    f.cleanup();
  }
});

test('gacar: accepts a published part in the band above 155', async () => {
  const f = fixture();
  try {
    // Part 179 is named as existing in .qoder/rules/10-gacar-citations.mdc. The
    // sentence claims nothing about what the part covers; only its number is
    // what the range check reads.
    f.write('guide.md', '# Guide\n\nGACAR Part 179 applies to this operation.\n');
    const result = await runGate({
      root: f.root,
      now: NOW,
      only: ['gacar'],
      config: { gacar: { include: ['**/*.md'], maxPart: MAX_PART } },
    });
    assert.deepEqual(result.errors, []);
  } finally {
    f.cleanup();
  }
});

test('gacar: the tests and scripts/gate.config.json agree on the range', () => {
  assert.equal(
    shippedConfig.gacar.maxPart,
    MAX_PART,
    'AGENTS.md says the published index runs 1-199; keep the config and these tests on one number',
  );
});
