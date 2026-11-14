# Weekly source refresh

Verify that the external sources this repository points at are still reachable.

## Rules

- Read-only. Do not modify repository files.
- Work only from tracked files: `git ls-files '*.md'`.
- Network use is limited to requests against URLs already present in those files.

## Steps

1. Collect unique `http`/`https` URLs from the tracked markdown files.
2. Request each with `HEAD`, falling back to `GET` when `HEAD` is rejected. Use a
   10 second timeout.
3. Classify each result:
   - `reachable` — 2xx or 3xx
   - `redirected` — note the final host when it differs
   - `needs-manual-check` — 403 or 429; do not call these dead
   - `broken` — other 4xx or 5xx
   - `unreachable` — timeout or DNS failure
4. Skip `localhost` and `127.0.0.1` targets.

## Report

- Total URLs checked, and a count per class.
- A table of everything not `reachable`: file, URL, status or error.
- No source counts as "clean" on a single 403 or 429.

The last line of your answer must be exactly one of:

```
SOURCES: ok <n>
SOURCES: issues <n>
```
