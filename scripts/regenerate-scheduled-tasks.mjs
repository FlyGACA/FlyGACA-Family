#!/usr/bin/env node
// Extend the Qoder scheduled-task expiry window. Dependency-free.
// Usage: node scripts/regenerate-scheduled-tasks.mjs [days]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(here, '..', '.qoder', 'scheduled_tasks.json');
const days = Math.max(1, Number(process.argv[2] || 7));

if (!fs.existsSync(file)) {
  console.error(`Not found: ${file}`);
  process.exit(2);
}

const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const today = new Date();
const expires = new Date(today.getTime() + days * 86400000);

const iso = (d) => d.toISOString().slice(0, 10);
config.generatedAt = iso(today);
config.expiresAt = iso(expires);

fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
console.log(`Scheduled tasks now valid until ${config.expiresAt} (${config.tasks.length} tasks).`);
