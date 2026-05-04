#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const indexPath =
  process.argv.find((arg) => arg.startsWith("--index="))?.slice(8) ??
  "docs/agent-memory/index.json";
const outDir =
  process.argv.find((arg) => arg.startsWith("--out="))?.slice(6) ??
  "agent-memory-vault";
if (!fs.existsSync(indexPath)) {
  console.error(`Missing memory index: ${indexPath}`);
  process.exit(2);
}
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });
const requirements = index.requirements?.items ?? [];
const decisions = index.decisions?.items ?? [];
const write = (name, body) =>
  fs.writeFileSync(path.join(outDir, name), body, "utf8");
write(
  "index.md",
  [
    "# Agent Memory",
    "",
    "## Requirements",
    ...requirements.map((req) => `- [[${req.id}]] - ${req.status}`),
    "",
    "## Decisions",
    ...decisions.map((adr) => `- [[${adr.id}]]`),
    "",
  ].join("\n"),
);
for (const req of requirements)
  write(
    `${req.id}.md`,
    `# ${req.id}\n\nStatus: ${req.status}\n\nSource: ${req.paths?.requirementRoot ?? "UNKNOWN"}\n`,
  );
for (const adr of decisions)
  write(`${adr.id}.md`, `# ${adr.id}\n\nStatus: ${adr.status ?? "recorded"}\n`);
console.log(
  JSON.stringify(
    { outDir, files: requirements.length + decisions.length + 1 },
    null,
    2,
  ),
);
