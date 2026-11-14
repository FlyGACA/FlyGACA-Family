# Weekly repository register audit

You are auditing the repository register for accuracy.

1. Run `node scripts/gate.mjs --only register --format json`.
2. Read the register table in `README.md` and `REPOSITORIES.md`.
3. For every row, confirm:
   - the repository exists and is reachable (`gh repo view <owner>/<name>` is fine for a read-only check)
   - the Owner column names a real team or user, ideally the one in CODEOWNERS
   - the Status column matches reality (active / archived / private / draft)
   - the description matches the repository's own README, not an older plan
4. Fix rows where the evidence is direct (CODEOWNERS, repository settings). Do not guess an owner; if you cannot establish one, leave the row and list it as needing a human decision.
5. Re-run `node scripts/gate.mjs --strict`.
6. Report: rows checked, rows changed, rows needing a decision, and the evidence you used.

Never run git or gh commands that write. This task is read-only apart from editing the register table in the working tree.
