#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const root = path.resolve(
  args.find((a) => a.startsWith("--root="))?.slice(7) ?? process.cwd(),
);
const json = args.includes("--json") || true;
const skip = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
]);

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else out.push(path.join(dir, entry.name));
  }
  return out;
};

const rel = (file) => path.relative(root, file).replace(/\\/g, "/");
const files = walk(root);
const packageFiles = files.filter(
  (file) => path.basename(file) === "package.json",
);
const packages = packageFiles
  .map((file) => ({ file, dir: path.dirname(file), json: readJson(file) }))
  .filter((item) => item.json);
const dependenciesOf = (pkg) => ({
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
  ...(pkg.peerDependencies ?? {}),
});
const allScripts = packages.flatMap((pkg) =>
  Object.entries(pkg.json.scripts ?? {}).map(([name, command]) => ({
    package: rel(pkg.file),
    name,
    command,
  })),
);

const hasDependency = (name) =>
  packages.find((pkg) => dependenciesOf(pkg.json)[name]);
const config = (names) =>
  files.find((file) => names.includes(path.basename(file)));
const testDirs = [
  ...new Set(
    files
      .filter((file) =>
        /(^|[\\/])(e2e|tests?|specs?|cypress)([\\/]|$)/i.test(file),
      )
      .map((file) => rel(path.dirname(file)).split("/").slice(0, 3).join("/")),
  ),
].filter(Boolean);

let framework = "none";
let workspace = null;
let version = null;
if (hasDependency("playwright-bdd")) {
  const hit = hasDependency("playwright-bdd");
  framework = "playwright-bdd";
  workspace = rel(hit.dir);
  version = dependenciesOf(hit.json)["playwright-bdd"];
} else if (
  hasDependency("@playwright/test") ||
  config([
    "playwright.config.ts",
    "playwright.config.js",
    "playwright.config.mjs",
  ])
) {
  const hit = hasDependency("@playwright/test");
  framework = "playwright";
  workspace = hit ? rel(hit.dir) : ".";
  version = hit ? dependenciesOf(hit.json)["@playwright/test"] : null;
} else if (
  hasDependency("cypress") ||
  config(["cypress.config.ts", "cypress.config.js", "cypress.config.mjs"])
) {
  const hit = hasDependency("cypress");
  framework = hasDependency("@badeball/cypress-cucumber-preprocessor")
    ? "cypress-cucumber"
    : "cypress";
  workspace = hit ? rel(hit.dir) : ".";
  version = hit ? dependenciesOf(hit.json).cypress : null;
} else if (
  hasDependency("@wdio/cli") ||
  config(["wdio.conf.ts", "wdio.conf.js"])
) {
  const hit = hasDependency("@wdio/cli");
  framework = "webdriverio";
  workspace = hit ? rel(hit.dir) : ".";
  version = hit ? dependenciesOf(hit.json)["@wdio/cli"] : null;
}

const e2eScripts = allScripts.filter((script) =>
  /e2e|playwright|cypress|wdio|selenium|browser|acceptance/i.test(
    `${script.name} ${script.command}`,
  ),
);
const devServer = allScripts.find((script) =>
  /^(dev|start|serve)$|dev:|start:/i.test(script.name),
);
const report = {
  rootDir: root,
  framework,
  version,
  workspace,
  configPath: config([
    "playwright.config.ts",
    "playwright.config.js",
    "playwright.config.mjs",
    "cypress.config.ts",
    "cypress.config.js",
    "wdio.conf.ts",
    "wdio.conf.js",
  ])
    ? rel(
        config([
          "playwright.config.ts",
          "playwright.config.js",
          "playwright.config.mjs",
          "cypress.config.ts",
          "cypress.config.js",
          "wdio.conf.ts",
          "wdio.conf.js",
        ]),
      )
    : null,
  testsDir: testDirs[0] ?? null,
  discoveredTestDirs: testDirs,
  featureFiles: files.filter((file) => file.endsWith(".feature")).map(rel),
  specFiles: files
    .filter((file) => /\.(spec|test|cy|e2e)\.[cm]?[jt]sx?$/.test(file))
    .map(rel),
  e2eScripts,
  devServer: devServer ?? null,
  resultHints: [
    "test-results",
    "playwright-report",
    "cypress/results",
    "reports",
  ].filter((hint) => fs.existsSync(path.join(root, hint))),
  nextAction:
    framework === "none"
      ? "Ask user which E2E framework to use before authoring tests."
      : "Use detected framework conventions before writing tests.",
};

if (json) console.log(JSON.stringify(report, null, 2));
