#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  process.argv.find((arg) => arg.startsWith("--root="))?.slice(7) ??
    process.cwd(),
);
const json = process.argv.includes("--json");
const skip = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !skip.has(entry.name)) walk(full, out);
    else if (entry.isFile() && /\.(html|tsx|jsx|vue|svelte)$/.test(entry.name))
      out.push(full);
  }
  return out;
};
const rel = (file) => path.relative(root, file).replace(/\\/g, "/");
const findings = [];
const push = (rule, file, line, message) =>
  findings.push({ rule, file: rel(file), line, message });
for (const file of walk(root)) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/<img\b(?![^>]*(alt=|role=["']presentation["']))/i.test(line))
      push(
        "img-alt",
        file,
        index + 1,
        "Image needs alt text or presentation role.",
      );
    if (
      /<button\b[^>]*>\s*<\/?(?:Icon|svg|span)[^>]*>\s*<\/button>/i.test(
        line,
      ) &&
      !/(aria-label|title=)/i.test(line)
    )
      push(
        "icon-button-name",
        file,
        index + 1,
        "Icon-only button needs an accessible name.",
      );
    if (
      /<div\b[^>]*onClick=/i.test(line) &&
      !/(role=|tabIndex=|onKeyDown=|onKeyUp=)/i.test(line)
    )
      push(
        "clickable-div",
        file,
        index + 1,
        "Clickable div needs role, keyboard support, and focusability.",
      );
    if (
      /<input\b/i.test(line) &&
      !/(aria-label=|aria-labelledby=|id=)/i.test(line)
    )
      push("input-name", file, index + 1, "Input needs a programmatic label.");
  });
}
if (json)
  console.log(JSON.stringify({ total: findings.length, findings }, null, 2));
else if (findings.length)
  findings.forEach((f) =>
    console.log(`[${f.rule}] ${f.file}:${f.line} ${f.message}`),
  );
else console.log("Static accessibility check: clean");
process.exit(findings.length ? 1 : 0);
