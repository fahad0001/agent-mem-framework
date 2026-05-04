#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const arg = (name, fallback = null) =>
  process.argv
    .find((a) => a.startsWith(`--${name}=`))
    ?.slice(name.length + 3) ?? fallback;
const baseUrl = arg("url", "http://localhost:3000");
const route = arg("route", "/");
const out = arg("out");
const timeout = Number(arg("timeout", "30000"));

let playwright;
try {
  playwright = require("@playwright/test");
} catch {
  try {
    playwright = require("playwright");
  } catch {
    console.error(
      "Playwright is not installed in this workspace. Install @playwright/test or use MCP browser tools.",
    );
    process.exit(2);
  }
}

const clean = `(value) => (value || "").trim().replace(/\\s+/g, " ").slice(0, 180)`;
const target = new URL(route, baseUrl).toString();
const browser = await playwright.chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(target, { waitUntil: "load", timeout });
try {
  await page.waitForLoadState("networkidle", { timeout });
} catch {}
const report = await page.evaluate((cleanSource) => {
  const clean = eval(cleanSource);
  const uniq = (items) => [...new Set(items.filter(Boolean))];
  const textOf = (selector) =>
    uniq(
      [...document.querySelectorAll(selector)].map((node) =>
        clean(node.textContent || node.getAttribute("aria-label")),
      ),
    );
  const dataAttributes = {};
  for (const node of document.querySelectorAll("*"))
    for (const attr of node.attributes)
      if (/^data-/.test(attr.name))
        (dataAttributes[attr.name] ||= new Set()).add(attr.value);
  return {
    url: location.href,
    title: document.title,
    headings: textOf("h1,h2,h3,h4,h5,h6"),
    buttons: textOf("button,[role=button]"),
    links: textOf("a[href]"),
    labels: textOf("label,[aria-label]"),
    dataAttributes: Object.fromEntries(
      Object.entries(dataAttributes).map(([key, values]) => [
        key,
        [...values].slice(0, 100),
      ]),
    ),
    bodyPreview: clean(document.body.innerText).slice(0, 1500),
  };
}, clean);
await browser.close();
const rendered = JSON.stringify(report, null, 2) + "\n";
if (out) {
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, rendered, "utf8");
} else process.stdout.write(rendered);
