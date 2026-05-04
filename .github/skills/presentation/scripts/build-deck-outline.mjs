#!/usr/bin/env node
import fs from "node:fs";

const args = process.argv.slice(2);
const input = args
  .find((arg) => arg.startsWith("--input="))
  ?.slice("--input=".length);
const json = args.includes("--json");
const out = args
  .find((arg) => arg.startsWith("--out="))
  ?.slice("--out=".length);

if (!input || !fs.existsSync(input)) {
  console.error(
    "Usage: node build-deck-outline.mjs --input=<markdown> [--json] [--out=<file>]",
  );
  process.exit(1);
}

const text = fs.readFileSync(input, "utf8").replace(/^\uFEFF/, "");
const headings = text
  .split(/\r?\n/)
  .map((line) => line.match(/^(#{1,3})\s+(.+)$/))
  .filter(Boolean)
  .map((match) => ({ level: match[1].length, title: match[2].trim() }));

const slides = headings.length
  ? headings.map((heading, index) => ({
      number: index + 1,
      title: heading.title,
      purpose: heading.level === 1 ? "section opener" : "supporting point",
      notes: "Add evidence, demo step, or decision needed.",
    }))
  : [
      {
        number: 1,
        title: "Untitled",
        purpose: "opening",
        notes: "Source had no headings.",
      },
    ];

const report = { source: input, slideCount: slides.length, slides };
const rendered = json
  ? JSON.stringify(report, null, 2) + "\n"
  : [
      `# Deck Outline: ${input}`,
      "",
      ...slides.map(
        (slide) =>
          `## Slide ${slide.number}: ${slide.title}\n\nPurpose: ${slide.purpose}\n\nNotes: ${slide.notes}\n`,
      ),
    ].join("\n");

if (out) fs.writeFileSync(out, rendered, "utf8");
else process.stdout.write(rendered);
