#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const input = process.argv.find((arg) => arg.startsWith("--input="))?.slice(8);
const json = process.argv.includes("--json");
const raw = input ? fs.readFileSync(input, "utf8") : "";

const parseChangedFiles = (text) => {
  if (text.trim().startsWith("{")) return JSON.parse(text).files ?? [];
  const section =
    text
      .split("=== CHANGED FILES (LIST) ===")[1]
      ?.split("=== FULL DIFF ===")[0] ?? text;
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split(/\s+/);
      return { status, path: rest.join(" ") };
    });
};

const classify = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  const ext = path.extname(normalized).toLowerCase();
  if (/package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock/.test(normalized))
    return {
      area: "dependency",
      risk: "high",
      checks: ["dependency audit", "lockfile review"],
    };
  if (/\.github\/workflows|\.github\/scripts|scripts\//.test(normalized))
    return {
      area: "automation",
      risk: "high",
      checks: ["command injection", "secret handling"],
    };
  if (/auth|token|secret|credential|permission|policy/i.test(normalized))
    return {
      area: "security",
      risk: "high",
      checks: ["authz boundary", "secret exposure"],
    };
  if (/docs\/agent-memory|AGENTS\.md|copilot-instructions/.test(normalized))
    return {
      area: "agent-memory",
      risk: "medium",
      checks: ["traceability", "AHC compliance"],
    };
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized))
    return {
      area: "test",
      risk: "medium",
      checks: ["coverage value", "determinism"],
    };
  if (/\.md$|README/i.test(normalized))
    return { area: "docs", risk: "low", checks: ["accuracy", "staleness"] };
  if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext))
    return {
      area: "source",
      risk: "medium",
      checks: ["correctness", "errors", "performance"],
    };
  return {
    area: "other",
    risk: "low",
    checks: ["review if generated or binary"],
  };
};

const files = parseChangedFiles(raw).map((entry) => ({
  ...entry,
  ...classify(entry.path),
}));
const report = {
  totals: files.reduce((acc, file) => {
    acc[file.risk] = (acc[file.risk] ?? 0) + 1;
    return acc;
  }, {}),
  files,
  reviewOrder: [...files]
    .sort(
      (a, b) =>
        ({ high: 0, medium: 1, low: 2 })[a.risk] -
        { high: 0, medium: 1, low: 2 }[b.risk],
    )
    .map((file) => file.path),
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  for (const file of report.files)
    console.log(
      `${file.risk.toUpperCase()} ${file.area.padEnd(14)} ${file.path}`,
    );
}
