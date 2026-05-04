#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const features = process.argv
  .find((a) => a.startsWith("--features="))
  ?.slice(11);
const specs = process.argv.find((a) => a.startsWith("--specs="))?.slice(8);
const json = process.argv.includes("--json");
if (!features && !specs) {
  console.error(
    "Usage: node meaningfulness-audit.mjs --features=<dir> [--specs=<dir>] [--json]",
  );
  process.exit(2);
}
const walk = (dir, out = []) => {
  if (!dir || !fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules"
    )
      walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
};
const rel = (file) => path.relative(process.cwd(), file).replace(/\\/g, "/");
const findings = [];
const push = (rule, file, line, message) =>
  findings.push({ rule, file: rel(file), line, message });

for (const file of walk(features).filter((f) => f.endsWith(".feature"))) {
  const text = fs.readFileSync(file, "utf8");
  const blocks = text.split(/^\s*Scenario(?: Outline)?:/m).slice(1);
  if (!/@R-\d{4}/.test(text))
    push(
      "no-requirement-tag",
      file,
      1,
      "Scenarios must be traceable to @R-XXXX.",
    );
  blocks.forEach((block, index) => {
    const line = text.slice(0, text.indexOf(block)).split(/\r?\n/).length;
    if (!/^\s*When\b/m.test(block))
      push(
        "no-user-action",
        file,
        line,
        `Scenario ${index + 1} has no When step.`,
      );
    if (!/^\s*Then\b/m.test(block))
      push(
        "no-observable-outcome",
        file,
        line,
        `Scenario ${index + 1} has no Then step.`,
      );
    if (
      /^\s*Then\b.{0,80}\b(is|are)\s+(visible|shown|displayed|present)\.?\s*$/im.test(
        block,
      ) &&
      !/count|contains|enabled|disabled|navigat|saved|created|deleted|updated/i.test(
        block,
      )
    )
      push(
        "presence-only",
        file,
        line,
        "Presence-only assertions are not meaningful enough.",
      );
  });
}
for (const file of walk(specs).filter((f) =>
  /\.(spec|test|cy|e2e)\.[cm]?[jt]sx?$/.test(f),
)) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(
    /\b(it|test)\s*\(\s*(["'`])([^"'`]+)\2([\s\S]*?)(?=\n\s*\b(?:it|test)\s*\(|\n\s*\}\s*\)\s*;?)/g,
  )) {
    const body = match[4];
    const line = text.slice(0, match.index).split(/\r?\n/).length;
    const expects = body.match(/\b(expect|should)\s*\(/g) ?? [];
    if (!expects.length)
      push(
        "no-expectation",
        file,
        line,
        `Test "${match[3]}" has no assertion.`,
      );
    else if (expects.length === 1 && /(toBeVisible|be\.visible)/.test(body))
      push(
        "visible-only",
        file,
        line,
        `Test "${match[3]}" only checks visibility.`,
      );
  }
}
if (json)
  console.log(JSON.stringify({ total: findings.length, findings }, null, 2));
else if (findings.length)
  findings.forEach((f) =>
    console.log(`[${f.rule}] ${f.file}:${f.line} ${f.message}`),
  );
else console.log("Meaningfulness audit: clean");
process.exit(findings.length ? 1 : 0);
