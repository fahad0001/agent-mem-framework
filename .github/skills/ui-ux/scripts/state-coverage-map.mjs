#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  process.argv.find((arg) => arg.startsWith("--root="))?.slice(7) ??
    process.cwd(),
);
const json = process.argv.includes("--json");
const states = [
  "loading",
  "empty",
  "error",
  "success",
  "disabled",
  "focused",
  "permission",
];
const skip = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !skip.has(entry.name)) walk(full, out);
    else if (
      entry.isFile() &&
      /\.(stories|test|spec)\.[cm]?[jt]sx?$/.test(entry.name)
    )
      out.push(full);
  }
  return out;
};
const files = walk(root);
const coverage = Object.fromEntries(states.map((state) => [state, []]));
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const state of states)
    if (new RegExp(state, "i").test(text))
      coverage[state].push(path.relative(root, file).replace(/\\/g, "/"));
}
const missing = states.filter((state) => coverage[state].length === 0);
const report = { filesScanned: files.length, coverage, missing };
if (json) console.log(JSON.stringify(report, null, 2));
else {
  for (const state of states)
    console.log(`${coverage[state].length ? "OK" : "MISS"} ${state}`);
}
process.exit(missing.length ? 1 : 0);
