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
    else if (
      entry.isFile() &&
      /\.(css|scss|sass|less|pcss|tsx|jsx)$/.test(entry.name)
    )
      out.push(full);
  }
  return out;
};
const rel = (file) => path.relative(root, file).replace(/\\/g, "/");
const findings = [];
const push = (rule, file, line, message) =>
  findings.push({ rule, file: rel(file), line, message });
for (const file of walk(root)) {
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (/font-size\s*:\s*[^;]*vw/i.test(line))
        push(
          "viewport-font",
          file,
          index + 1,
          "Avoid font-size tied directly to viewport width.",
        );
      if (/letter-spacing\s*:\s*-/i.test(line))
        push(
          "negative-letter-spacing",
          file,
          index + 1,
          "Avoid negative letter spacing in app UI.",
        );
      if (/width\s*:\s*100vw/i.test(line))
        push(
          "100vw-overflow",
          file,
          index + 1,
          "100vw can cause horizontal overflow when scrollbars are present.",
        );
      if (
        /position\s*:\s*absolute/i.test(line) &&
        !/inset|top|left|right|bottom/.test(line)
      )
        push(
          "absolute-without-anchors",
          file,
          index + 1,
          "Absolute positioning needs explicit anchors and responsive review.",
        );
    });
}
if (json)
  console.log(JSON.stringify({ total: findings.length, findings }, null, 2));
else if (findings.length)
  findings.forEach((f) =>
    console.log(`[${f.rule}] ${f.file}:${f.line} ${f.message}`),
  );
else console.log("Responsive token scan: clean");
process.exit(findings.length ? 1 : 0);
