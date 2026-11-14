# Weekly GACAR / AIP source refresh

You are checking whether the regulatory sources behind this repository are still current.

1. List every `source-verified:` marker: `node scripts/gate.mjs --only sources --format json`.
2. For each file with a marker, identify the GACAR part or AIP cycle it relies on.
3. Compare against the official publications at gaca.gov.sa (regulations and AIP). Use only the official source; do not rely on third-party summaries.
4. If the source is unchanged, update the marker to today's date and note in the PR description that you checked the official publication.
5. If the source changed, do **not** rewrite the regulation yourself. Open a finding that names the file, the citation, and the change observed, and leave the content edit to a human reviewer.
6. Run `node scripts/gate.mjs --strict` and report the result.

Never invent a citation, a part number, or a verification date. An unverifiable claim stays marked as unverified.
