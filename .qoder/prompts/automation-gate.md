# Scheduled repository gate

You are running the scheduled, read-only gate for this repository.

## Rules

- Read-only. Do not create, modify, stage, commit, or delete any file.
- Do not install dependencies.
- From the repository root, run exactly one command: `node scripts/gate.mjs`
- Do not work around a failing check. Report it as it is.

## Report

Return a short report:

1. One line per failing or warning check: check name, then the message.
2. The exact final line the script printed.

If the script cannot run — missing file, crash, non-zero exit before printing a
GATE line — say so and include the error text verbatim. Never invent a GATE line.

The last line of your answer must be exactly one of:

```
GATE: clean
GATE: warnings <n>
GATE: errors <n>
```
