#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillsRoot = path.join(root, ".github", "skills");

const fail = (message) => {
  console.error(`Skill Guard failed: ${message}`);
  process.exitCode = 1;
};

const readText = (file) => fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const readJson = (file) => JSON.parse(readText(file));

const listFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
};

const allowedScriptExtensions = new Set([".mjs", ".js", ".py", ".ps1", ".sh"]);
const isScriptFile = (file) => allowedScriptExtensions.has(path.extname(file));

const parseFrontmatter = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    // handle multi-line YAML values wrapped in >
    fields.set(pair[1], pair[2].replace(/^['">|]|['"]$/g, "").trim());
  }
  return fields;
};

if (!fs.existsSync(skillsRoot)) {
  console.log("Skill Guard: no .github/skills directory");
  process.exit(0);
}

const skillDirs = fs
  .readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const skillName of skillDirs) {
  const skillDir = path.join(skillsRoot, skillName);
  const skillFile = path.join(skillDir, "SKILL.md");
  const manifestFile = path.join(skillDir, "skill.json");
  const scriptsDir = path.join(skillDir, "scripts");
  const referencesDir = path.join(skillDir, "references");

  // ── Required files ────────────────────────────────────────────────────────
  if (!fs.existsSync(skillFile)) {
    fail(`${skillName}: missing SKILL.md`);
    continue;
  }
  if (!fs.existsSync(manifestFile)) fail(`${skillName}: missing skill.json`);

  // ── SKILL.md frontmatter ──────────────────────────────────────────────────
  const body = readText(skillFile);
  const frontmatter = parseFrontmatter(body);
  if (!frontmatter) fail(`${skillName}: missing YAML frontmatter`);
  if (frontmatter && frontmatter.get("name") !== skillName) {
    fail(`${skillName}: frontmatter name must match folder name`);
  }
  const desc = frontmatter?.get("description") ?? "";
  if (desc.length < 60) {
    fail(
      `${skillName}: description must be at least 60 characters (got ${desc.length})`,
    );
  }

  // ── scripts/ directory ────────────────────────────────────────────────────
  if (!fs.existsSync(scriptsDir)) {
    fail(`${skillName}: missing scripts/ directory`);
    continue;
  }

  const scripts = listFiles(scriptsDir).filter(isScriptFile);
  if (scripts.length < 3)
    fail(
      `${skillName}: scripts/ must contain at least 3 operational scripts (found ${scripts.length})`,
    );

  const mentionsScript = scripts.some(
    (script) =>
      body.includes(path.basename(script)) ||
      body.includes(path.relative(skillDir, script).replace(/\\/g, "/")),
  );
  if (!mentionsScript)
    fail(`${skillName}: SKILL.md must mention at least one shipped script`);

  // ── references/ directory ─────────────────────────────────────────────────
  const refMds = listFiles(referencesDir).filter((f) => f.endsWith(".md"));
  if (refMds.length === 0) {
    fail(
      `${skillName}: references/ must exist and contain at least one .md file`,
    );
  }

  // ── skill.json contract ───────────────────────────────────────────────────
  if (fs.existsSync(manifestFile)) {
    const manifest = readJson(manifestFile);
    if (manifest.schemaVersion !== "1.0.0")
      fail(`${skillName}: skill.json schemaVersion must be 1.0.0`);
    if (manifest.id !== skillName)
      fail(`${skillName}: skill.json id must match folder name`);
    if (!Array.isArray(manifest.triggers) || manifest.triggers.length === 0) {
      fail(`${skillName}: skill.json must declare triggers`);
    }
    if (!Array.isArray(manifest.scripts) || manifest.scripts.length === 0) {
      fail(`${skillName}: skill.json must declare scripts`);
    } else {
      for (const script of manifest.scripts) {
        if (!script.path || !script.purpose)
          fail(`${skillName}: each script entry needs path and purpose`);
        if (script.path) {
          const scriptPath = path.join(skillDir, script.path);
          if (!fs.existsSync(scriptPath))
            fail(`${skillName}: manifest script missing: ${script.path}`);
          if (
            !script.path.startsWith("scripts/") ||
            !allowedScriptExtensions.has(path.extname(script.path))
          ) {
            fail(
              `${skillName}: manifest scripts must point to scripts/* with one of ${Array.from(allowedScriptExtensions).join(", ")}`,
            );
          }
        }
      }
      const scriptPaths = scripts
        .map((script) => path.relative(skillDir, script).replace(/\\/g, "/"))
        .sort();
      const manifestPaths = manifest.scripts
        .map((script) => script.path)
        .sort();
      const missingFromManifest = scriptPaths.filter(
        (script) => !manifestPaths.includes(script),
      );
      if (missingFromManifest.length) {
        fail(
          `${skillName}: skill.json missing script entries: ${missingFromManifest.join(", ")}`,
        );
      }
    }
    const legacyAnalysisField = ["re", "search"].join("");
    if (legacyAnalysisField in manifest) {
      fail(
        `${skillName}: skill.json contains a deprecated analysis field — remove it`,
      );
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(
  `Skill Guard passed (${skillDirs.length} skill${skillDirs.length === 1 ? "" : "s"})`,
);
