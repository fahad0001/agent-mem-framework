#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";

const command = process.argv
  .find((arg) => arg.startsWith("--command="))
  ?.slice(10);
const cwd =
  process.argv.find((arg) => arg.startsWith("--cwd="))?.slice(6) ??
  process.cwd();
if (!command) {
  console.error(
    "Usage: node command-evidence.mjs --command=<command> [--cwd=<dir>]",
  );
  process.exit(2);
}
const shell = process.platform === "win32" ? "powershell.exe" : "/bin/sh";
const shellArgs =
  process.platform === "win32"
    ? ["-NoProfile", "-Command", command]
    : ["-lc", command];
const startedAt = new Date().toISOString();
const result = spawnSync(shell, shellArgs, {
  cwd,
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 10,
});
const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
console.log(
  JSON.stringify(
    {
      kind: "command",
      command,
      cwd,
      startedAt,
      finishedAt: new Date().toISOString(),
      exitCode: result.status,
      signal: result.signal,
      outputSha256: crypto.createHash("sha256").update(output).digest("hex"),
      outputPreview: output.slice(0, 4000),
    },
    null,
    2,
  ),
);
process.exit(result.status ?? 1);
