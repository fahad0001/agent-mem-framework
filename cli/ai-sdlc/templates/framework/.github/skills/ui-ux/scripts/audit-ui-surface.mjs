#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const json = process.argv.includes("--json");
const root = process.cwd();
const skip = new Set(["node_modules", ".git", "dist", "build", "coverage"]);
const uiDirs = /(^|[\/])(app|pages|routes|components|ui|views|src)([\/]|$)/;

const walk = (dir, predicate, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(path.relative(root, full).replace(/\\/g, "/"));
    }
  }
  return out;
};

const uiFiles = walk(
  root,
  (file) => uiDirs.test(file) && /\.[jt]sx?$/.test(file),
);
const styleFiles = walk(root, (file) =>
  /\.(css|scss|sass|less|pcss)$/.test(file),
);
const storyFiles = walk(root, (file) => /\.stories\.[jt]sx?$/.test(file));
const testFiles = walk(root, (file) => /\.(test|spec)\.[jt]sx?$/.test(file));

const report = {
  counts: {
    uiFiles: uiFiles.length,
    styleFiles: styleFiles.length,
    storyFiles: storyFiles.length,
    testFiles: testFiles.length,
  },
  samples: {
    uiFiles: uiFiles.slice(0, 40),
    styleFiles: styleFiles.slice(0, 20),
    storyFiles: storyFiles.slice(0, 20),
  },
  checks: [
    "Verify empty, loading, error, success, and permission-limited states.",
    "Verify keyboard focus order and accessible names for interactive controls.",
    "Verify responsive text fit and no content overlap at mobile and desktop widths.",
  ],
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log("# UI Surface Audit\n");
  for (const [key, value] of Object.entries(report.counts))
    console.log(`- ${key}: ${value}`);
  console.log("\n## Checks");
  for (const check of report.checks) console.log(`- ${check}`);
}
