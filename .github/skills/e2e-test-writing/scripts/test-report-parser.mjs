#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = process.argv.find((a) => a.startsWith("--results="))?.slice(10);
const filter = process.argv.find((a) => a.startsWith("--filter="))?.slice(9);
const json = process.argv.includes("--json");
if (!target) {
  console.error(
    "Usage: node test-report-parser.mjs --results=<file-or-dir> [--filter=@R-0001] [--json]",
  );
  process.exit(2);
}

const collect = (item, out = []) => {
  if (!fs.existsSync(item)) return out;
  const stat = fs.statSync(item);
  if (stat.isDirectory())
    for (const entry of fs.readdirSync(item))
      collect(path.join(item, entry), out);
  else if (/\.(xml|json)$/i.test(item)) out.push(item);
  return out;
};
const extractTags = (text) => text?.match(/@[A-Za-z0-9_-]+/g) ?? [];
const cases = [];
for (const file of collect(target)) {
  const text = fs.readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    try {
      const parsed = JSON.parse(text);
      const suites = parsed.suites ?? [];
      const visit = (suite, parents = []) => {
        for (const child of suite.suites ?? [])
          visit(child, [...parents, suite.title].filter(Boolean));
        for (const spec of suite.specs ?? [])
          for (const test of spec.tests ?? [])
            for (const result of test.results ?? [])
              cases.push({
                source: file,
                suite: parents.join(" > "),
                scenario: spec.title,
                status:
                  result.status === "passed"
                    ? "passed"
                    : result.status === "skipped"
                      ? "skipped"
                      : "failed",
                durationMs: result.duration ?? 0,
                message: result.error?.message ?? null,
                tags: extractTags(spec.title),
              });
      };
      suites.forEach((suite) => visit(suite));
    } catch {}
  } else {
    for (const match of text.matchAll(
      /<testcase\b([^>]*)>([\s\S]*?)<\/testcase>|<testcase\b([^\/]*)\/>/g,
    )) {
      const attrs = match[1] ?? match[3] ?? "";
      const body = match[2] ?? "";
      const attr = (name) =>
        attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "";
      const scenario = attr("name");
      const failed = /<(failure|error)\b/.test(body);
      const skipped = /<skipped\b/.test(body);
      cases.push({
        source: file,
        suite: attr("classname"),
        scenario,
        status: failed ? "failed" : skipped ? "skipped" : "passed",
        durationMs: Number(attr("time") || 0) * 1000,
        message: body.match(/message="([^"]*)"/)?.[1] ?? null,
        tags: extractTags(scenario),
      });
    }
  }
}
const filtered = filter
  ? cases.filter(
      (item) => item.scenario.includes(filter) || item.tags.includes(filter),
    )
  : cases;
const report = {
  total: filtered.length,
  passed: filtered.filter((c) => c.status === "passed").length,
  failed: filtered.filter((c) => c.status === "failed").length,
  skipped: filtered.filter((c) => c.status === "skipped").length,
  failures: filtered.filter((c) => c.status === "failed"),
};
if (json) console.log(JSON.stringify(report, null, 2));
else
  console.log(
    `total ${report.total}\npassed ${report.passed}\nfailed ${report.failed}\nskipped ${report.skipped}`,
  );
process.exit(report.failed ? 1 : 0);
