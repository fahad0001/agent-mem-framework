#!/usr/bin/env node
import fs from "node:fs";

const indexPath =
  process.argv.find((arg) => arg.startsWith("--index="))?.slice(8) ??
  "docs/agent-memory/index.json";
const out =
  process.argv.find((arg) => arg.startsWith("--out="))?.slice(6) ??
  "memory-dashboard.html";
if (!fs.existsSync(indexPath)) {
  console.error(`Missing memory index: ${indexPath}`);
  process.exit(2);
}
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const rows = (index.requirements?.items ?? [])
  .map(
    (req) =>
      `<tr><td>${req.id}</td><td>${req.title ?? ""}</td><td>${req.status}</td><td>${req.priority ?? ""}</td></tr>`,
  )
  .join("\n");
const html = `<!doctype html><meta charset="utf-8"><title>Agent Memory Dashboard</title><style>body{font-family:system-ui;margin:2rem;color:#1f2937}table{border-collapse:collapse;width:100%}td,th{border:1px solid #d1d5db;padding:.5rem;text-align:left}th{background:#f3f4f6}</style><h1>Agent Memory Dashboard</h1><p>Generated ${new Date().toISOString()}</p><table><thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Priority</th></tr></thead><tbody>${rows}</tbody></table>`;
fs.writeFileSync(out, html, "utf8");
console.log(`Wrote ${out}`);
