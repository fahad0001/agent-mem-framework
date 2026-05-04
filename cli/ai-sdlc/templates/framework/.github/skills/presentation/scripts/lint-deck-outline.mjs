#!/usr/bin/env node
import fs from "node:fs";

const input = process.argv.find((arg) => arg.startsWith("--input="))?.slice(8);
const json = process.argv.includes("--json");
if (!input || !fs.existsSync(input)) {
  console.error("Usage: node lint-deck-outline.mjs --input=<deck.md> [--json]");
  process.exit(2);
}

const text = fs.readFileSync(input, "utf8");
const slides = text
  .split(/^##\s+/m)
  .slice(1)
  .map((chunk, index) => {
    const [titleLine, ...bodyLines] = chunk.split(/\r?\n/);
    return {
      number: index + 1,
      title: titleLine.trim(),
      body: bodyLines.join("\n"),
    };
  });
const findings = [];
const push = (rule, slide, message) => findings.push({ rule, slide, message });
if (!slides.length)
  findings.push({
    rule: "no-slides",
    slide: null,
    message: "Deck markdown must use ## headings for slides.",
  });
for (const slide of slides) {
  if (slide.title.length < 8)
    push(
      "weak-title",
      slide.number,
      "Slide title is too short to carry a clear assertion.",
    );
  if (
    /^(overview|introduction|summary|background|next steps)$/i.test(slide.title)
  )
    push(
      "topic-label-title",
      slide.number,
      "Use an assertion headline, not a generic topic label.",
    );
  if (
    /(lorem|ipsum|placeholder|tbd|todo|xxxx)/i.test(
      `${slide.title}\n${slide.body}`,
    )
  )
    push(
      "placeholder-text",
      slide.number,
      "Remove placeholder text before delivery.",
    );
  const bullets = (slide.body.match(/^\s*[-*]\s+/gm) ?? []).length;
  if (bullets > 5)
    push(
      "too-many-bullets",
      slide.number,
      "Use fewer bullets or split the slide.",
    );
  if (
    !/(image:|visual:|chart:|diagram:|screenshot:|```mermaid|!\[)/i.test(
      slide.body,
    )
  )
    push(
      "missing-visual-plan",
      slide.number,
      "Every slide needs a planned visual, chart, screenshot, or diagram.",
    );
  if (!/(notes:|speaker notes:)/i.test(slide.body))
    push(
      "missing-speaker-notes",
      slide.number,
      "Add speaker notes or a talk track for this slide.",
    );
}
const report = { input, slideCount: slides.length, findings };
if (json) console.log(JSON.stringify(report, null, 2));
else if (findings.length)
  findings.forEach((f) =>
    console.log(`[${f.rule}] slide ${f.slide ?? "deck"}: ${f.message}`),
  );
else console.log("Deck outline lint: clean");
process.exit(findings.length ? 1 : 0);
