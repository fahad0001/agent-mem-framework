#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const memoryRoot = path.join(root, "docs", "agent-memory");
const check = process.argv.includes("--check");

const normalize = (file) => path.relative(root, file).replace(/\\/g, "/");
const readJson = (file) =>
  JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const writeJson = (file, data) => {
  const text = JSON.stringify(data, null, 2) + "\n";
  if (check) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    if (current !== text) {
      console.error(`Folder index stale: ${normalize(file)}`);
      process.exitCode = 1;
    }
    return;
  }
  fs.writeFileSync(file, text, "utf8");
};

const describeFolder = (relative) => {
  if (relative === "docs/agent-memory") return "Canonical agent memory root.";
  if (relative.endsWith("02-requirements"))
    return "Requirement artifacts grouped by R-XXXX.";
  if (relative.endsWith("03-plans"))
    return "Planning artifacts grouped by R-XXXX.";
  if (relative.endsWith("04-execution"))
    return "Execution artifacts grouped by R-XXXX.";
  if (relative.endsWith("05-evaluation"))
    return "Evaluation artifacts grouped by R-XXXX.";
  if (relative.endsWith("06-decisions"))
    return "Architecture decision records.";
  if (relative.endsWith("metrics")) return "Metrics and measurement artifacts.";
  return "Agent memory folder.";
};

const kindFor = (name) => {
  if (/^R-\d{4}$/.test(name)) return "requirement";
  if (/^ADR-\d{4}/.test(name)) return "decision";
  if (name === "metrics") return "metrics";
  if (name.startsWith("0")) return "phase";
  return "support";
};

const collectDirs = (dir, out = []) => {
  out.push(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    collectDirs(path.join(dir, entry.name), out);
  }
  return out;
};

if (!fs.existsSync(memoryRoot)) {
  console.error("Missing docs/agent-memory");
  process.exit(1);
}

const dirs = collectDirs(memoryRoot).sort((a, b) =>
  normalize(a).localeCompare(normalize(b)),
);
const folderIndexItems = [];

for (const dir of dirs) {
  const relative = normalize(dir);
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "index.json")
    .map((entry) => ({
      file: normalize(path.join(dir, entry.name)),
      kind: path.extname(entry.name).replace(/^\./, "") || "file",
    }))
    .sort((a, b) => a.file.localeCompare(b.file));
  const subfolders = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      folder: normalize(path.join(dir, entry.name)),
      kind: kindFor(entry.name),
      indexFile: normalize(path.join(dir, entry.name, "index.json")),
    }))
    .sort((a, b) => a.folder.localeCompare(b.folder));

  const indexFile = path.join(dir, "index.json");
  if (dir !== memoryRoot) {
    writeJson(indexFile, {
      schemaVersion: "1.0.0",
      folder: relative,
      description: describeFolder(relative),
      files,
      subfolders,
    });
  }
  folderIndexItems.push({
    folder: relative,
    kind: dir === memoryRoot ? "root" : kindFor(path.basename(dir)),
    indexFile: normalize(indexFile),
    description: describeFolder(relative),
  });
}

const mainIndexPath = path.join(memoryRoot, "index.json");
const mainIndex = readJson(mainIndexPath);
const nextIndex = {
  ...mainIndex,
  ...(check ? {} : { generatedAt: new Date().toISOString() }),
  folderIndexes: {
    generatedBy: ".github/scripts/agent-memory-build-folder-indexes.mjs",
    root: "docs/agent-memory",
    items: folderIndexItems,
  },
};

writeJson(mainIndexPath, nextIndex);

if (process.exitCode) process.exit(process.exitCode);
console.log(
  `Agent memory folder indexes ${check ? "validated" : "written"}: ${folderIndexItems.length}`,
);
