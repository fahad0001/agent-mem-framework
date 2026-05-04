#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const json = process.argv.includes("--json");
const root = process.cwd();
const skip = new Set(["node_modules", ".git", "dist", "build", "coverage"]);

const walk = (dir, predicate, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skip.has(entry.name))
        walk(path.join(dir, entry.name), predicate, out);
    } else {
      const full = path.join(dir, entry.name);
      if (predicate(full))
        out.push(path.relative(root, full).replace(/\\/g, "/"));
    }
  }
  return out;
};

const packageJson = path.join(root, "package.json");
const scripts = fs.existsSync(packageJson)
  ? (JSON.parse(fs.readFileSync(packageJson, "utf8")).scripts ?? {})
  : {};

const configs = walk(root, (file) =>
  /(^|[\/])(playwright|cypress)\.config\.[cm]?[jt]s$/.test(file),
);
const tests = walk(root, (file) =>
  /(e2e|tests?|specs?).*\.(spec|test)\.[cm]?[jt]sx?$/.test(
    file.replace(/\\/g, "/"),
  ),
);
const appEntrypoints = walk(root, (file) =>
  /(src|app|pages|routes)[\/].*\.[jt]sx?$/.test(file),
);
const e2eScripts = Object.entries(scripts).filter(([name, command]) =>
  /e2e|playwright|cypress/i.test(`${name} ${command}`),
);

const report = {
  configs,
  tests,
  e2eScripts: e2eScripts.map(([name, command]) => ({ name, command })),
  appEntrypoints: appEntrypoints.slice(0, 50),
  recommendations: [
    configs.length
      ? "Use existing runner config."
      : "Add a runner config before writing e2e tests.",
    e2eScripts.length
      ? "Use an existing e2e npm script."
      : "Add an npm script for the selected e2e runner.",
    "Prefer role, label, and text locators over CSS selectors.",
  ],
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log("# E2E Surface\n");
  console.log(`Configs: ${configs.length ? configs.join(", ") : "none"}`);
  console.log(`Tests: ${tests.length}`);
  console.log("\n## E2E Scripts");
  for (const item of report.e2eScripts)
    console.log(`- ${item.name}: ${item.command}`);
  console.log("\n## Recommendations");
  for (const item of report.recommendations) console.log(`- ${item}`);
}
