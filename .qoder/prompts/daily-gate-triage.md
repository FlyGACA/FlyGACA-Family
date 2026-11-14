# Daily gate triage

You are triaging the FlyGACA content gate for this repository.

1. Run `node scripts/gate.mjs --format json` and read the findings.
2. Group them by check: disclaimer, gacar, bilingual, register, links, sources.
3. Fix only unambiguous, non-regulatory problems:
   - broken relative links and anchors
   - missing English counterparts (create the file with a faithful translation of the existing Arabic)
   - missing Owner cells when CODEOWNERS or the repository's maintainers make the owner clear
   - missing source-verified markers where the file already cites a verifiable source
4. Do **not** invent or change GACAR citations, part numbers, aviation facts, or verification dates. If a `gacar` or `sources` finding needs a regulatory judgement, leave it and describe what a human must verify.
5. Re-run `node scripts/gate.mjs --strict` after your edits.
6. Report: findings before, findings after, files changed, and anything left for a human with the exact file and line.

Never run git commands as part of this task. Leave the working tree for review.
