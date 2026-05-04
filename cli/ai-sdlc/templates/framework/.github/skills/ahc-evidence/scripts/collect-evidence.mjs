#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const filesArg = args
  .find((arg) => arg.startsWith("--files="))
  ?.slice("--files=".length);
const files = filesArg
  ? filesArg
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  : args.filter((arg) => !arg.startsWith("--"));

if (files.length === 0) {
  console.error(
    "Usage: node collect-evidence.mjs --files=<path,path> or node collect-evidence.mjs <path> [...]",
  );
  process.exit(1);
}

const sha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const evidence = files.map((file) => {
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute))
    return { kind: "file", path: file, exists: false, confidence: "unknown" };
  const stat = fs.statSync(absolute);
  return {
    kind: "file",
    path: path.relative(process.cwd(), absolute).replace(/\\/g, "/"),
    exists: true,
    bytes: stat.size,
    sha256: sha256(absolute),
  };
});

console.log(
  JSON.stringify({ generatedAt: new Date().toISOString(), evidence }, null, 2),
);
