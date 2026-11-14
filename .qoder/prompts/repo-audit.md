# Weekly register audit

Audit that the repository's tracked inventory is internally consistent.

## Rules

- Read-only. Do not modify files.
- Treat `git ls-files` as the inventory of record.
- Skip any check whose target directory does not exist in this repository.

## Checks

1. **Orphans** — tracked files under `brand/`, `public/` and `.github/readme/`
   that no markdown file references by path.
2. **Brand marks** — every `brand/mark-*.png` file is referenced from at least
   one markdown file.
3. **Outline** — list the H1/H2 outline of each tracked markdown file.
4. **Filenames** — report tracked files with spaces, uppercase extensions, or
   non-ASCII characters. Report only; these are not errors on their own.

## Report

- One section per check, with findings grouped by directory.
- State the count of tracked files examined.

The last line of your answer must be exactly one of:

```
AUDIT: clean
AUDIT: findings <n>
```
