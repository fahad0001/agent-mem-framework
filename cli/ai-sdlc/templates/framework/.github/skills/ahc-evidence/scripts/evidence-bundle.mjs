#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const out = process.argv.find((arg) => arg.startsWith("--out="))?.slice(6);
const files = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
if (!out || files.length === 0) {
  console.error(
    "Usage: node evidence-bundle.mjs --out=<bundle.json> <file> [...]",
  );
  process.exit(2);
}
const records = files.map((file) => {
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute))
    return { kind: "file", path: file, exists: false, confidence: "UNKNOWN" };
  const bytes = fs.readFileSync(absolute);
  return {
    kind: "file",
    path: path.relative(process.cwd(), absolute).replace(/\\/g, "/"),
    exists: true,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
});
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(
  out,
  JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2) +
    "\n",
  "utf8",
);
console.log(`Wrote ${out}`);
