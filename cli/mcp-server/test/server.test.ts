import { describe, it, expect } from "vitest";
import process from "node:process";
import path from "node:path";
import { execSync } from "node:child_process";
import fs from "node:fs";

describe("mcp server", () => {
  it("server passes a basic lifecycle over stdio in one shot", () => {
    // This executes the MCP server directly via Node and passes in a prepared script
    // that pipes two lines to stdin (initialize, then am.status tool call).
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cwd = fs.mkdtempSync(path.join(cacheDir, "mcp-test-"));
    const memDir = path.join(cwd, "docs", "agent-memory");
    fs.mkdirSync(memDir, { recursive: true });
    fs.writeFileSync(
      path.join(memDir, "index.json"),
      JSON.stringify({ requirements: { items: [] } }),
      "utf8",
    );

    const scriptPath = path.join(cwd, "run.js");
    fs.writeFileSync(
      scriptPath,
      `
const { spawn } = require('child_process');
const path = require('path');
const cp = spawn(
  process.execPath,
  [path.resolve('${path.resolve(__dirname, "..", "dist", "server.js").replace(/\\/g, "\\\\")}'), '--cwd', '${cwd.replace(/\\/g, "\\\\")}'],
  { stdio: ['pipe', 'pipe', 'inherit'] }
);

let out = "";
cp.stdout.on('data', b => out += b.toString());
cp.on('close', () => {
  console.log("---MCP-STDOUT---");
  console.log(out);
});

// JSON-RPC requests
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }) + "\\n");
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) + "\\n");
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "am.status" } }) + "\\n");
cp.stdin.end();
`,
      "utf8",
    );
    const out = execSync(`node ${scriptPath}`, { encoding: "utf8" });
    expect(out).toContain("am.status");
    expect(out).toContain("am.list_requirements");
    expect(out).toContain("am.context_pack");
    expect(out).toContain("am.graph");
    expect(out).toContain("items"); // result from am.status (json-encoded text)
    expect(out).toContain("[]"); // empty array string from parsed request payload
  });

  it("writable mode exposes mutating tools and creates ADRs", () => {
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cwd = fs.mkdtempSync(path.join(cacheDir, "mcp-write-"));
    const memDir = path.join(cwd, "docs", "agent-memory");
    fs.mkdirSync(path.join(memDir, "06-decisions"), { recursive: true });
    fs.writeFileSync(
      path.join(memDir, "index.json"),
      JSON.stringify({ requirements: { items: [] } }),
      "utf8",
    );

    const scriptPath = path.join(cwd, "run-write.js");
    fs.writeFileSync(
      scriptPath,
      `
const { spawn } = require('child_process');
const path = require('path');
const cp = spawn(
  process.execPath,
  [path.resolve('${path.resolve(__dirname, "..", "dist", "server.js").replace(/\\/g, "\\\\")}'), '--cwd', '${cwd.replace(/\\/g, "\\\\")}', '--writable'],
  { stdio: ['pipe', 'pipe', 'inherit'] }
);
let out = "";
cp.stdout.on('data', b => out += b.toString());
cp.on('close', () => { console.log("---MCP-STDOUT---"); console.log(out); });
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) + "\\n");
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "am.create_adr", arguments: { title: "Use SQLite", status: "Accepted" } } }) + "\\n");
cp.stdin.end();
`,
      "utf8",
    );
    const out = execSync(`node ${scriptPath}`, { encoding: "utf8" });
    expect(out).toContain("am.create_requirement");
    expect(out).toContain("am.create_adr");
    expect(out).toContain("ADR-0001-use-sqlite.md");
    const adrFile = path.join(memDir, "06-decisions", "ADR-0001-use-sqlite.md");
    expect(fs.existsSync(adrFile)).toBe(true);
    const body = fs.readFileSync(adrFile, "utf8");
    expect(body).toContain("# ADR-0001: Use SQLite");
    expect(body).toContain("Status: Accepted");
  });

  it("am.context_pack returns deterministic sha256-pinned records", () => {
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cwd = fs.mkdtempSync(path.join(cacheDir, "mcp-pack-"));
    const memDir = path.join(cwd, "docs", "agent-memory");
    fs.mkdirSync(path.join(memDir, "02-requirements", "R-0001"), {
      recursive: true,
    });
    fs.mkdirSync(path.join(memDir, "06-decisions"), { recursive: true });
    fs.writeFileSync(
      path.join(memDir, "00-project-context.md"),
      "# ctx\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(memDir, "02-requirements", "R-0001", "requirement.md"),
      "alpha\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(memDir, "06-decisions", "ADR-0001-x.md"),
      "# ADR\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(memDir, "index.json"),
      JSON.stringify({
        requirements: {
          items: [{ id: "R-0001", title: "alpha", status: "Draft" }],
        },
      }),
      "utf8",
    );
    const scriptPath = path.join(cwd, "run.js");
    fs.writeFileSync(
      scriptPath,
      `
const { spawn } = require('child_process');
const path = require('path');
const cp = spawn(
  process.execPath,
  [path.resolve('${path.resolve(__dirname, "..", "dist", "server.js").replace(/\\/g, "\\\\")}'), '--cwd', '${cwd.replace(/\\/g, "\\\\")}'],
  { stdio: ['pipe', 'pipe', 'inherit'] }
);
let out = "";
cp.stdout.on('data', b => out += b.toString());
cp.on('close', () => { console.log("---MCP-STDOUT---"); console.log(out); });
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "am.context_pack", arguments: { excludeBodies: true } } }) + "\\n");
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "am.graph", arguments: { format: "mermaid" } } }) + "\\n");
cp.stdin.end();
`,
      "utf8",
    );
    const out = execSync(`node ${scriptPath}`, { encoding: "utf8" });
    expect(out).toContain("counts");
    expect(out).toContain("ADR-0001-x.md");
    expect(out).toMatch(/[a-f0-9]{64}/); // a sha256 in the response
    expect(out).toContain("flowchart LR");
    expect(out).toContain("R-0001");
  });

  it("am.changelog renders MD with completed items, ADRs, and event tally", () => {
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cwd = fs.mkdtempSync(path.join(cacheDir, "mcp-cl-"));
    const memDir = path.join(cwd, "docs", "agent-memory");
    fs.mkdirSync(memDir, { recursive: true });
    const recent = new Date(Date.now() - 86_400_000).toISOString();
    const stale = new Date(Date.now() - 90 * 86_400_000).toISOString();
    fs.writeFileSync(
      path.join(memDir, "index.json"),
      JSON.stringify({
        project: { name: "demo" },
        requirements: {
          items: [
            {
              id: "R-0001",
              title: "Recent",
              status: "Done",
              doneAt: recent,
              tags: ["api"],
            },
            { id: "R-0002", title: "Stale", status: "Done", doneAt: stale },
          ],
        },
        decisions: {
          items: [{ id: "ADR-0001", title: "Pick sqlite", status: "Accepted" }],
        },
        events: [
          { type: "status-change", at: recent, payload: { id: "R-0001" } },
        ],
      }),
      "utf8",
    );
    const scriptPath = path.join(cwd, "run.js");
    fs.writeFileSync(
      scriptPath,
      `
const { spawn } = require('child_process');
const path = require('path');
const cp = spawn(
  process.execPath,
  [path.resolve('${path.resolve(__dirname, "..", "dist", "server.js").replace(/\\/g, "\\\\")}'), '--cwd', '${cwd.replace(/\\/g, "\\\\")}'],
  { stdio: ['pipe', 'pipe', 'inherit'] }
);
let out = "";
cp.stdout.on('data', b => out += b.toString());
cp.on('close', () => { console.log("---MCP-STDOUT---"); console.log(out); });
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }) + "\\n");
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "am.changelog", arguments: { windowDays: 30 } } }) + "\\n");
cp.stdin.end();
`,
      "utf8",
    );
    const out = execSync(`node ${scriptPath}`, { encoding: "utf8" });
    expect(out).toContain("am.changelog");
    expect(out).toContain("# Changelog — demo");
    expect(out).toContain("R-0001");
    expect(out).not.toContain("R-0002");
    expect(out).toContain("ADR-0001");
    expect(out).toContain("status-change");
  });

  it("am.release_notes filters by ISO range", () => {
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cwd = fs.mkdtempSync(path.join(cacheDir, "mcp-rn-"));
    const memDir = path.join(cwd, "docs", "agent-memory");
    fs.mkdirSync(memDir, { recursive: true });
    fs.writeFileSync(
      path.join(memDir, "index.json"),
      JSON.stringify({
        project: { name: "demo" },
        requirements: {
          items: [
            {
              id: "R-0001",
              title: "InRange",
              status: "Done",
              doneAt: "2026-02-15T00:00:00Z",
            },
            {
              id: "R-0002",
              title: "Old",
              status: "Done",
              doneAt: "2025-01-01T00:00:00Z",
            },
          ],
        },
        decisions: {
          items: [{ id: "ADR-0001", title: "Pick sqlite", status: "Accepted" }],
        },
        events: [],
      }),
      "utf8",
    );
    const scriptPath = path.join(cwd, "run.js");
    fs.writeFileSync(
      scriptPath,
      `
const { spawn } = require('child_process');
const path = require('path');
const cp = spawn(
  process.execPath,
  [path.resolve('${path.resolve(__dirname, "..", "dist", "server.js").replace(/\\/g, "\\\\")}'), '--cwd', '${cwd.replace(/\\/g, "\\\\")}'],
  { stdio: ['pipe', 'pipe', 'inherit'] }
);
let out = "";
cp.stdout.on('data', b => out += b.toString());
cp.on('close', () => { console.log("---MCP-STDOUT---"); console.log(out); });
cp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "am.release_notes", arguments: { since: "2026-01-01T00:00:00Z", until: "2026-04-01T00:00:00Z", version: "v1.0.0" } } }) + "\\n");
cp.stdin.end();
`,
      "utf8",
    );
    const out = execSync(`node ${scriptPath}`, { encoding: "utf8" });
    expect(out).toContain("# Release Notes — demo");
    expect(out).toContain("v1.0.0");
    expect(out).toContain("R-0001");
    expect(out).not.toContain("R-0002");
    expect(out).toContain("ADR-0001");
  });
});
