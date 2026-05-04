#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const format =
  args.find((arg) => arg.startsWith("--format="))?.slice("--format=".length) ??
  "mermaid";
const out = args
  .find((arg) => arg.startsWith("--out="))
  ?.slice("--out=".length);
const indexPath =
  args.find((arg) => arg.startsWith("--index="))?.slice("--index=".length) ??
  "docs/agent-memory/index.json";

if (!fs.existsSync(indexPath)) {
  console.error(`Missing memory index: ${indexPath}`);
  process.exit(1);
}

const index = JSON.parse(
  fs.readFileSync(indexPath, "utf8").replace(/^\uFEFF/, ""),
);
const requirements = index.requirements?.items ?? [];
const decisions = index.decisions?.items ?? [];

const renderMermaid = () => {
  const lines = ["flowchart TD", "  memory[Agent Memory]"];
  for (const req of requirements) {
    lines.push(`  ${req.id.replace(/-/g, "_")}[${req.id}: ${req.status}]`);
    lines.push(`  memory --> ${req.id.replace(/-/g, "_")}`);
    for (const adr of req.links?.relatedAdrs ?? [])
      lines.push(
        `  ${req.id.replace(/-/g, "_")} --> ${adr.replace(/-/g, "_")}`,
      );
  }
  for (const adr of decisions)
    lines.push(`  ${adr.id.replace(/-/g, "_")}[${adr.id}]`);
  return lines.join("\n") + "\n";
};

const renderDot = () => {
  const lines = ["digraph AgentMemory {", '  memory [label="Agent Memory"];'];
  for (const req of requirements) {
    const node = req.id.replace(/-/g, "_");
    lines.push(`  ${node} [label=\"${req.id}: ${req.status}\"];`);
    lines.push(`  memory -> ${node};`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
};

const writeObsidian = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
  const indexLines = ["# Agent Memory", "", "## Requirements"];
  for (const req of requirements) {
    const file = path.join(dir, `${req.id}.md`);
    fs.writeFileSync(
      file,
      `# ${req.id}\n\nStatus: ${req.status}\n\nSource: ${req.paths?.requirementRoot ?? "UNKNOWN"}\n`,
      "utf8",
    );
    indexLines.push(`- [[${req.id}]] - ${req.status}`);
  }
  fs.writeFileSync(
    path.join(dir, "index.md"),
    indexLines.join("\n") + "\n",
    "utf8",
  );
  return (
    JSON.stringify(
      { written: requirements.length + 1, directory: dir },
      null,
      2,
    ) + "\n"
  );
};

let rendered;
if (format === "mermaid") rendered = renderMermaid();
else if (format === "dot") rendered = renderDot();
else if (format === "obsidian") rendered = writeObsidian(out ?? "memory-vault");
else {
  console.error("Supported formats: mermaid, dot, obsidian");
  process.exit(1);
}

if (format !== "obsidian" && out) fs.writeFileSync(out, rendered, "utf8");
else if (format !== "obsidian") process.stdout.write(rendered);
else process.stdout.write(rendered);
