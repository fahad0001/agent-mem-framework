#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const input = process.argv.find((arg) => arg.startsWith("--input="))?.slice(8);
const json = process.argv.includes("--json");
if (!input || !fs.existsSync(input)) {
  console.error("Usage: node asset-inventory.mjs --input=<deck.md> [--json]");
  process.exit(2);
}
const root = path.dirname(path.resolve(input));
const text = fs.readFileSync(input, "utf8");
const markdownImages = [...text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(
  (m) => m[1],
);
const labeledAssets = [
  ...text.matchAll(/(?:image|visual|screenshot|chart|diagram):\s*(.+)$/gim),
].map((m) => m[1].trim());
const assets = [...new Set([...markdownImages, ...labeledAssets])].map(
  (asset) => {
    const clean = asset.replace(/^['"]|['"]$/g, "").split(/\s+/)[0];
    const local = !/^https?:\/\//i.test(clean);
    const full = local ? path.resolve(root, clean) : null;
    return {
      asset: clean,
      local,
      exists: local ? fs.existsSync(full) : null,
      extension: path.extname(clean).toLowerCase() || null,
    };
  },
);
const report = {
  input,
  total: assets.length,
  missing: assets.filter((a) => a.local && !a.exists),
  remote: assets.filter((a) => !a.local),
  assets,
};
if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Assets: ${assets.length}`);
  for (const asset of assets)
    console.log(`${asset.exists === false ? "MISSING" : "OK"} ${asset.asset}`);
}
process.exit(report.missing.length ? 1 : 0);
