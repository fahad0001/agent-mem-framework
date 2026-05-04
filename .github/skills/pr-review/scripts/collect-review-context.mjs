#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const json = args.includes("--json");
const baseArg = args.find((arg) => arg.startsWith("--base="));
const base = baseArg ? baseArg.slice("--base=".length) : "HEAD";

const runGit = (gitArgs) => {
  try {
    return execFileSync("git", gitArgs, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const parseNameStatus = (text) =>
  text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split(/\t+/);
      return { status, path: rest.join("\t") };
    });

const changed = parseNameStatus(runGit(["diff", "--name-status", base, "--"]));
const staged = parseNameStatus(
  runGit(["diff", "--cached", "--name-status", "--"]),
);
const untracked = runGit(["ls-files", "--others", "--exclude-standard"])
  .split(/\r?\n/)
  .filter(Boolean);

const classify = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  if (/\.test\.[cm]?[jt]sx?$|\.spec\.[cm]?[jt]sx?$/.test(normalized))
    return "test";
  if (/docs\/agent-memory|framework-dev\//.test(normalized)) return "memory";
  if (/\.github\/workflows|\.github\/scripts/.test(normalized))
    return "automation";
  if (/package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock/.test(normalized))
    return "dependency";
  if (/README|\.md$/.test(normalized)) return "docs";
  return "source";
};

const files = [...changed, ...staged].map((entry) => ({
  ...entry,
  kind: classify(entry.path),
}));
const uniquePaths = new Set(files.map((entry) => entry.path));
for (const filePath of untracked) {
  if (!uniquePaths.has(filePath))
    files.push({ status: "??", path: filePath, kind: classify(filePath) });
}

const packageJson = path.join(process.cwd(), "package.json");
const scripts = fs.existsSync(packageJson)
  ? Object.keys(JSON.parse(fs.readFileSync(packageJson, "utf8")).scripts ?? {})
  : [];

const report = {
  base,
  counts: files.reduce((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
    return acc;
  }, {}),
  files,
  suggestedChecks: scripts.filter((script) =>
    /test|typecheck|lint|build|check/i.test(script),
  ),
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`# Review Context\n\nBase: ${base}\n`);
  console.log("## Changed Files");
  for (const entry of report.files)
    console.log(`- ${entry.status} ${entry.path} (${entry.kind})`);
  console.log("\n## Suggested Checks");
  for (const script of report.suggestedChecks)
    console.log(`- npm run ${script}`);
}
