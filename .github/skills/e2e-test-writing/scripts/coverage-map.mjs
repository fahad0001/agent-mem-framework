#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const arg = (name, fallback = null) =>
  process.argv
    .find((a) => a.startsWith(`--${name}=`))
    ?.slice(name.length + 3) ?? fallback;
const requirementsDir = arg("requirements");
const featuresDir = arg("features");
const idPattern = new RegExp(arg("id-pattern", "@R-\\d{4}"), "g");
const reqIdPattern = new RegExp(arg("req-id-pattern", "R-\\d{4}"));
const json = process.argv.includes("--json");

if (!requirementsDir || !featuresDir) {
  console.error(
    "Usage: node coverage-map.mjs --requirements=<dir> --features=<dir> [--json]",
  );
  process.exit(2);
}

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const rel = (file) => path.relative(process.cwd(), file).replace(/\\/g, "/");
const requirements = new Map();
for (const file of walk(requirementsDir).filter((f) =>
  /\.(md|txt)$/i.test(f),
)) {
  const id = rel(file).match(reqIdPattern)?.[0];
  if (!id) continue;
  const text = fs.readFileSync(file, "utf8");
  const candidates = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^([-*]|\d+[.)])\s+\S/.test(line))
    .map((line) => line.replace(/^([-*]|\d+[.)])\s+/, "").trim())
    .filter((line) => line.length > 8);
  const existing = requirements.get(id) ?? { id, files: [], candidates: [] };
  existing.files.push(rel(file));
  existing.candidates.push(...candidates);
  requirements.set(id, existing);
}

const scenariosById = new Map();
const orphaned = [];
for (const file of walk(featuresDir).filter((f) => f.endsWith(".feature"))) {
  const text = fs.readFileSync(file, "utf8");
  const scenarioTitles = [
    ...text.matchAll(/^\s*Scenario(?: Outline)?:\s*(.+)$/gm),
  ].map((m) => m[1].trim());
  const tags = text.match(idPattern) ?? [];
  if (!tags.length) {
    for (const title of scenarioTitles)
      orphaned.push({
        scenario: title,
        file: rel(file),
        reason: "no requirement tag",
      });
    continue;
  }
  for (const tag of tags) {
    const id = tag.replace(/^@/, "");
    const list = scenariosById.get(id) ?? [];
    for (const title of scenarioTitles)
      list.push({ title, file: rel(file), tag });
    scenariosById.set(id, list);
  }
}

const covered = [];
const missing = [];
for (const [id, req] of requirements) {
  const scenarios = scenariosById.get(id) ?? [];
  if (scenarios.length) covered.push({ id, scenarios });
  else
    missing.push({
      id,
      files: req.files,
      suggestedScenarios: [...new Set(req.candidates)].slice(0, 8),
    });
}
for (const [id, scenarios] of scenariosById) {
  if (!requirements.has(id))
    for (const scenario of scenarios)
      orphaned.push({
        ...scenario,
        reason: `tagged ${id} but no requirement exists`,
      });
}

const report = { covered, missing, orphaned };
if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Covered: ${covered.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Orphaned: ${orphaned.length}`);
}
process.exit(missing.length ? 1 : 0);
