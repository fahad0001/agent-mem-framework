#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith("--")) ?? "main";
const noDiff = args.includes("--no-diff");
const json = args.includes("--json");
const out = args.find((arg) => arg.startsWith("--out="))?.slice(6);

const git = (gitArgs, allowFailure = false) => {
  try {
    return execFileSync("git", gitArgs, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (allowFailure) return "";
    throw new Error((error.stderr?.toString() || error.message).trim());
  }
};

const resolveTarget = () => {
  if (git(["rev-parse", "--verify", `refs/heads/${target}`], true))
    return `refs/heads/${target}`;
  if (git(["rev-parse", "--verify", `refs/remotes/origin/${target}`], true))
    return `refs/remotes/origin/${target}`;
  console.error(
    `Target branch not found locally or at origin/${target}: ${target}`,
  );
  process.exit(2);
};

try {
  git(["rev-parse", "--git-dir"]);
} catch {
  console.error("Not a git repository.");
  process.exit(1);
}
const targetRef = resolveTarget();
const head = git(["rev-parse", "HEAD"]);
const targetHead = git(["rev-parse", targetRef]);
if (head === targetHead) {
  console.error("Current HEAD equals target branch. Nothing to review.");
  process.exit(3);
}
const mergeBase = git(["merge-base", "HEAD", targetRef], true);
if (!mergeBase) {
  console.error("No common ancestor found.");
  process.exit(1);
}

const nameStatus = git(["diff", "--name-status", `${mergeBase}..HEAD`], true);
const numstat = git(["diff", "--numstat", `${mergeBase}..HEAD`], true);
const commits = git(
  ["log", "--oneline", "--decorate=no", `${targetRef}..HEAD`],
  true,
);
const stat = git(["diff", "--stat", `${mergeBase}..HEAD`], true);
const diff = noDiff
  ? "(omitted: --no-diff)"
  : git(["diff", "--no-color", `${mergeBase}..HEAD`], true);
const files = nameStatus
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [status, ...rest] = line.split(/\t+/);
    return { status, path: rest.join("\t") };
  });
let additions = 0;
let deletions = 0;
for (const line of numstat.split(/\r?\n/).filter(Boolean)) {
  const [add, del] = line.split(/\t+/);
  if (add !== "-") additions += Number(add) || 0;
  if (del !== "-") deletions += Number(del) || 0;
}
const report = {
  target,
  targetRef,
  head,
  targetHead,
  mergeBase,
  commits: commits.split(/\r?\n/).filter(Boolean),
  files,
  totals: { files: files.length, additions, deletions, diffBytes: diff.length },
  stat,
  diff,
};

const rendered = json
  ? JSON.stringify(report, null, 2) + "\n"
  : [
      "=== REVIEW METADATA ===",
      `Target branch: ${target}`,
      `Diff base: ${mergeBase.slice(0, 12)}`,
      `Files changed: ${files.length}`,
      `Lines added: +${additions}`,
      `Lines deleted: -${deletions}`,
      `Diff size: ${diff.length} bytes`,
      "",
      "=== COMMITS ===",
      commits || "(none)",
      "",
      "=== CHANGED FILES (STAT) ===",
      stat || "(none)",
      "",
      "=== CHANGED FILES (LIST) ===",
      nameStatus || "(none)",
      "",
      "=== FULL DIFF ===",
      diff,
      "",
    ].join("\n");

if (out) fs.writeFileSync(out, rendered, "utf8");
else process.stdout.write(rendered);
