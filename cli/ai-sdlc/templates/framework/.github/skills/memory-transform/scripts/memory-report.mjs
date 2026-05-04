#!/usr/bin/env node
import fs from "node:fs";

const indexPath =
  process.argv.find((arg) => arg.startsWith("--index="))?.slice(8) ??
  "docs/agent-memory/index.json";
const out = process.argv.find((arg) => arg.startsWith("--out="))?.slice(6);
if (!fs.existsSync(indexPath)) {
  console.error(`Missing memory index: ${indexPath}`);
  process.exit(2);
}
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const requirements = index.requirements?.items ?? [];
const decisions = index.decisions?.items ?? [];
const lines = [
  "# Agent Memory Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Requirements",
  "",
];
for (const req of requirements)
  lines.push(`- ${req.id}: ${req.title ?? "Untitled"} (${req.status})`);
lines.push("", "## Decisions", "");
for (const adr of decisions)
  lines.push(
    `- ${adr.id}: ${adr.title ?? "Untitled"} (${adr.status ?? "recorded"})`,
  );
const rendered = lines.join("\n") + "\n";
if (out) fs.writeFileSync(out, rendered, "utf8");
else process.stdout.write(rendered);
