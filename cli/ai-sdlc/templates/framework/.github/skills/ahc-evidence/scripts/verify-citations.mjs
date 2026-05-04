#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const artifact = process.argv
  .find((arg) => arg.startsWith("--artifact="))
  ?.slice(11);
const json = process.argv.includes("--json");
if (!artifact || !fs.existsSync(artifact)) {
  console.error(
    "Usage: node verify-citations.mjs --artifact=<markdown> [--json]",
  );
  process.exit(2);
}
const text = fs.readFileSync(artifact, "utf8");
const candidates = [
  ...text.matchAll(
    /(?:^|[\s(])((?:\.github|docs|cli|mcp-server|scripts|framework-dev|AGENTS\.md|README\.md)[^\s)`,]*)/g,
  ),
].map((m) => m[1].replace(/[.,;:]$/, ""));
const checks = [...new Set(candidates)].map((candidate) => ({
  path: candidate,
  exists: fs.existsSync(path.resolve(candidate)),
}));
const missing = checks.filter((check) => !check.exists);
const report = { artifact, total: checks.length, missing, checks };
if (json) console.log(JSON.stringify(report, null, 2));
else if (missing.length)
  missing.forEach((item) => console.log(`MISSING ${item.path}`));
else console.log("Citation check: clean");
process.exit(missing.length ? 1 : 0);
