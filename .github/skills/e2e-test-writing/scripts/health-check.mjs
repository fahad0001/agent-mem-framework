#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const testsDir = process.argv
  .find((a) => a.startsWith("--tests-dir="))
  ?.slice(12);
const json = process.argv.includes("--json");
if (!testsDir) {
  console.error("Usage: node health-check.mjs --tests-dir=<dir> [--json]");
  process.exit(2);
}

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
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

for (const file of walk(testsDir).filter((f) =>
  /\.(feature|spec|test|cy|e2e|steps?)\.[cm]?[jt]sx?$|\.feature$/i.test(f),
)) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  let hasWhen = false;
  let hasThen = false;
  lines.forEach((line, index) => {
    if (
      /(waitForTimeout|cy\.wait\s*\(\s*\d+|Thread\.sleep)/.test(line) &&
      !/@allow-timeout/.test(line)
    )
      push(
        "no-fixed-waits",
        file,
        index + 1,
        "Use web-first synchronization instead of fixed time waits.",
      );
    if (
      /(locator|getBy|find|get)\s*\(\s*["'`][^"'`]*\.[A-Za-z][A-Za-z0-9_-]+/.test(
        line,
      )
    )
      push(
        "no-css-class-selectors",
        file,
        index + 1,
        "Use role, label, text, or stable data attributes instead of CSS classes.",
      );
    if (/^\s*(Given|When|Then|And|But)\b.*\[data-/.test(line))
      push(
        "no-dom-language-gherkin",
        file,
        index + 1,
        "Gherkin must describe user behavior, not DOM selectors.",
      );
    if (/^\s*When\b/.test(line)) hasWhen = true;
    if (/^\s*Then\b/.test(line)) hasThen = true;
  });
  if (file.endsWith(".feature")) {
    if (!/@R-\d{4}/.test(lines.join("\n")))
      push(
        "missing-requirement-tag",
        file,
        1,
        "Feature file needs an @R-XXXX requirement tag.",
      );
    if (!hasWhen)
      push("missing-when", file, 1, "Feature file has no user action step.");
    if (!hasThen)
      push(
        "missing-then",
        file,
        1,
        "Feature file has no observable outcome step.",
      );
  }
}

if (json)
  console.log(JSON.stringify({ total: findings.length, findings }, null, 2));
else if (findings.length)
  findings.forEach((f) =>
    console.log(`[${f.rule}] ${f.file}:${f.line} ${f.message}`),
  );
else console.log("E2E health check: clean");
process.exit(findings.length ? 1 : 0);
