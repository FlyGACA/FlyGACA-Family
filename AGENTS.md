# AGENTS.md — FlyGACA content policies

This repository uses the FlyGACA content gate. These policies apply to humans and agents editing Markdown content.

If a rule in `.qoder/rules/*.mdc` conflicts with this file, **the more specific `.qoder/rules` rule wins**. This file gives the shared baseline.

## Before you edit

- Read the rule files in `.qoder/rules/` that match the file you are changing.
- Never invent a GACAR citation, part number, verification date, owner, or regulatory fact. If a claim cannot be verified against gaca.gov.sa, mark it unverified instead of asserting it.

## The six policies

1. **Disclaimer.** Every public surface states, in English and Arabic, that Fly GACA is independent and not affiliated with GACA. The Arabic sentence must contain the negation, not only "independent".
2. **GACAR citations.** Write `GACAR § 91.3` or `GACAR Part 91`. Never `14 CFR`, `FAR`, `FAA Part`, `§91`, `§§`, or a part outside 1–199 (the published index ends at Part 199). Verify the mapping before rewriting an FAA reference.
3. **Bilingual parity.** Every `*_AR.md` has a sibling English file with the same sections and citations. Never ship one language alone.
4. **Repository register.** Any table of repositories has `Repository` **and** `Owner` columns. Owner is a real GitHub team/user; never "unverified", TBD, or blank.
5. **Links.** Relative paths, anchors matching real headings; update inbound links when renaming.
6. **Source freshness.** Pages with regulatory claims carry `source-verified: YYYY-MM-DD`, refreshed when the GACAR part or AIP cycle changes. Markers older than 180 days fail.

## How to check your work

```bash
node scripts/gate.mjs            # human-readable
node scripts/gate.mjs --strict   # warnings also fail
node scripts/gate.mjs --only links --external   # network check
node --test test/gate.test.mjs   # the gate's own tests
```

Do not edit the gate or its tests to make a finding disappear. Fix the content, or leave the finding for a human.

## Scheduled work

`.qoder/scheduled_tasks.json` defines the daily triage and weekly refresh tasks; prompts live in `.qoder/prompts/`. Tasks expire seven days after `generatedAt`; run `node scripts/regenerate-scheduled-tasks.mjs` to extend. The durable schedules are in `.github/workflows/qoder-gate.yml`.

## Git

The installer and these tasks do not run git. Commit, push, and open PRs are separate, explicit steps.
