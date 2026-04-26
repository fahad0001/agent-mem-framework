# agent-mem-framework

> A universal, AI-assisted SDLC framework + CLI (`agent-mem`) that bootstraps any new project with a deterministic, multi-agent, anti-hallucination memory system.

It scaffolds a `docs/agent-memory/` knowledge base, generates per-vendor AI rules (Copilot, Cursor, Claude, Windsurf, Cline, Aider, Continue, opencode, generic MCP), and ships a CLI that drives requirements through:

```
Draft → Planned → Processed → Implemented → Evaluated → Done
```

with file-based memory, sha256-pinned context packs, ADRs, audits, an autonomous orchestrator, and an interactive brainstorm flow.

---

## Table of contents

- [Why](#why)
- [Repo layout](#repo-layout)
- [Requirements](#requirements)
- [Quick start (this repo / framework dev)](#quick-start-this-repo--framework-dev)
- [Use it in a NEW project](#use-it-in-a-new-project)
- [The two flows: Brainstorm + Autopilot](#the-two-flows-brainstorm--autopilot)
- [Day-to-day commands](#day-to-day-commands)
- [Quality gates / CI](#quality-gates--ci)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Why

Most "AI-in-the-SDLC" setups break down because the model has no durable, auditable memory and no enforced state machine. This framework fixes both:

- **Durable file-based memory** under `docs/agent-memory/` — single source of truth, machine-indexed (`index.json`), human-indexed (`08-progress-index.md`).
- **Anti-Hallucination Charter (AHC)** — every claim is pinned to evidence (file, command, or human input); context packs are sha256-locked and drift-checked.
- **Multi-agent SDLC** — Init → Plan → Process → Execution → Evaluation → Finalization, each with its own prompt and PRE/POST contract.
- **Vendor-agnostic** — the same rules render to Copilot, Cursor, Claude, Windsurf, Cline, Aider, Continue, opencode, and a generic MCP `agents.json`.

---

## Repo layout

```
.
├─ AGENTS.md                       # Agent Operating Contract (root)
├─ .github/
│  ├─ workflows/                   # CI: schema, AHC, hashes, drift, guard, sbom, msrd, release
│  ├─ scripts/                     # Validators that power `npm run check`
│  ├─ agents/                      # Subagent prompts (init/plan/process/execution/evaluation/finalization/...)
│  ├─ prompts/                     # Reusable prompt fragments
│  └─ copilot-instructions.md      # Workspace-level Copilot rules
├─ cli/
│  ├─ agent-mem/                   # The CLI (this is what users install)
│  │  ├─ src/                      # Commands + engines (brainstorm, autopilot, ...)
│  │  ├─ templates/
│  │  │  ├─ framework/             # Files copied into target projects
│  │  │  └─ stacks/                # Stack-specific overlays (next, expo, fastify, dlt+dbt, ...)
│  │  └─ test/                     # Vitest tests
│  └─ mcp-server/                  # stdio MCP server exposing memory as tools
├─ docs/
│  ├─ agent-memory/                # The canonical memory pack
│  │  ├─ 00-project-context.md
│  │  ├─ 01-architecture.md
│  │  ├─ 02-requirements/R-XXXX/
│  │  ├─ 03-plans/R-XXXX/
│  │  ├─ 04-execution/R-XXXX/
│  │  ├─ 05-evaluation/R-XXXX/
│  │  ├─ 06-decisions/             # ADRs
│  │  ├─ 07-quality-gates.md
│  │  ├─ 08-progress-index.md
│  │  ├─ 09-audits/
│  │  ├─ index.json                # Machine source of truth
│  │  ├─ index.schema.json
│  │  ├─ index.rules.md
│  │  └─ known-issues.md
│  └─ agent-logs/                  # YYYY-MM-DD__R-XXXX__<agent>.md
└─ package.json                    # npm workspace root
```

---

## Requirements

- **Node.js ≥ 20** (LTS recommended)
- **npm ≥ 10** (workspaces). pnpm/bun also work for consumers.
- Optional: `git`, GitHub Actions runner for CI gates.
- Windows, macOS, and Linux are all supported.

---

## Quick start (this repo / framework dev)

```powershell
# 1) Install
npm install

# 2) Build the CLI (runs prebuild sync of templates/framework/)
npm run cli:build

# 3) Run the full test suite
npm run cli:test          # vitest, ~71 tests

# 4) Run all quality gates (schema, AHC, hashes, drift, guard)
npm run check
```

If `npm run check` is green, the framework is healthy.

To use the local CLI without publishing:

```powershell
node cli/agent-mem/dist/cli.js --help
# or link globally:
npm link -w agent-mem
agent-mem --help
```

---

## Use it in a NEW project

This is the typical consumer flow.

### Option A — `npx` (recommended)

```bash
# inside an empty (or existing) project directory
npx agent-mem init
```

`init` is interactive. It will:

1. Detect or ask for project metadata (name, kind, stack).
2. Scaffold `docs/agent-memory/`, `AGENTS.md`, `.github/agents/`, prompts, scripts, workflows.
3. Emit per-vendor AI rule files (`.github/copilot-instructions.md`, `.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `AIDER_CONVENTIONS.md`, `.continue/config.yaml`, `opencode.json`, `.mcp/agents.json`).
4. Stamp `bootstrap.lock` so future commands know the project is initialized.

### Option B — Adopt an existing repo

```bash
npx agent-mem adopt
# or, deeper detection:
npx agent-mem adopt --deep
```

`adopt` inspects what already exists (PRs, issues, ADRs, READMEs) and proposes requirements + ADRs to import without overwriting your code.

### Option C — Brainstorm first, then init

If you don't yet know what you're building:

```bash
npx agent-mem brainstorm
```

This walks you through an interactive intake (problem, users, personas, constraints, NFRs, risks). It writes:

- `project-brief.md`
- `project-brief.json`

Both are resumable (`agent-mem brainstorm --resume project-brief.json`). Feed the brief into init/create:

```bash
npx agent-mem create --from-brief project-brief.json
```

### After init — pick a stack overlay

```bash
npx agent-mem init --stack next-app-router-ts
# stacks shipped today:
#   next-app-router-ts, expo-router, node-fastify-ts, node-commander-ts,
#   tsup-changesets-ts, turborepo-pnpm, docusaurus-ts, terraform-cdktf-ts,
#   tauri-ts, playwright-ts, python-dlt-dbt, python-langgraph, generic
```

---

## The two flows: Brainstorm + Autopilot

### Brainstorm (human-in-the-loop intake)

```bash
agent-mem brainstorm                       # interactive
agent-mem brainstorm --out my-brief.md     # custom output
agent-mem brainstorm --resume my-brief.json
```

Outputs are AHC-compliant — every answer is recorded with `evidence.kind=human`. The classifier surfaces stack/kind recommendations with a confidence score (no fake authority).

### Autopilot (autonomous SDLC orchestrator)

Runs requirements through every stage, in parallel where dependencies allow.

```bash
# Dry-run all Draft requirements through the full pipeline:
agent-mem autopilot --dry-run

# Real run for one requirement (3 parallel, 60-min budget):
agent-mem autopilot --requirement R-0007 --max-parallel 3 --budget-minutes 60

# Run everything, stop on first failure:
agent-mem autopilot --requirement all --stop-on-fail
```

By default autopilot runs in **simulated mode** — it advances state machines, appends events to `index.json.events[]`, and writes log stubs you (or an LLM) can fill in.

To plug in a real LLM/agent runner, set:

```powershell
$env:AGENT_MEM_RUNNER = "my-agent-runner.exe"
agent-mem autopilot --requirement R-0007
```

The runner is invoked as `<runner> <agentId> <requirementId> <cwd>`. Exit code 0 = success.

---

## Day-to-day commands

```text
agent-mem init                       # scaffold a project
agent-mem brainstorm                 # interactive intake → project-brief.{md,json}
agent-mem create [--from-brief ...]  # create R-XXXX requirement folder + meta
agent-mem adopt [--deep]             # import an existing project
agent-mem autopilot [...]            # autonomous SDLC orchestrator

agent-mem status                     # quick state of all requirements
agent-mem doctor [--json]            # health check (memory layout, AHC overlays, AI surfaces, CI)
agent-mem validate                   # validate index.json + AHC
agent-mem repair                     # safe self-heal of common drift
agent-mem audit [--fix]              # write a dated audit report; --fix creates skeletons

agent-mem new requirement            # template-driven requirement scaffold
agent-mem promote   <R-XXXX> <stage>
agent-mem archive   <R-XXXX>
agent-mem migrate-schema             # bump index.json schema

agent-mem claim     <R-XXXX> <agent> # take an exclusive lock
agent-mem release   <R-XXXX>         # drop the lock

agent-mem ki list|add|resolve        # known-issues.md helpers
agent-mem adr new "<title>"          # ADR scaffold
agent-mem events                     # recent events from index.json

agent-mem graph         [--format mermaid|dot] [--include-adrs] [--out FILE]
agent-mem context-pack  [--requirement R-XXXX] [--exclude-bodies] [--pretty] [--out FILE]
agent-mem verify-pack   <pack.jsonl>     # detect drift vs on-disk memory
agent-mem changelog     [--window-days 30] [--group-by status|tag|none] [--format md|json]
agent-mem release-notes [--from <tag>] [--to HEAD]
agent-mem msrd          # Memory-State Readiness Document
agent-mem report        # roll-up report
agent-mem dashboard     # render dashboard.html

agent-mem attest-pack   # produce signed attestation bundle
agent-mem verify-attest # verify a bundle
agent-mem sbom-check    # CycloneDX/SPDX SBOM gate
agent-mem sbom-diff     # diff two SBOMs
agent-mem threat-coverage    # threat model coverage gate
agent-mem provenance-verify  # SLSA provenance check
agent-mem dora-export        # export DORA metrics

agent-mem mcp [--writable]   # serve the memory as a stdio MCP server
```

Run any command with `--help` for full options.

---

## Quality gates / CI

Run locally:

```bash
npm run check
```

This runs (in order):

1. `validate:schema` — JSON-schema validation of `index.json`
2. `lint:ahc` — Anti-Hallucination Charter linter (no claim without evidence)
3. `verify:hashes` — sha256 pins for memory artifacts
4. `ci:drift` — workflow ↔ package.json ↔ `index.profiles.commands` drift detector
5. `guard` — final policy guard (status transitions, log naming, traceability)

In GitHub Actions, scaffolded projects get workflows under `.github/workflows/`:

- `ci.yml` — runs `npm run check` on every PR
- `release.yml` — gated on Done requirements + verify-pack
- `sbom.yml` — emits and diffs SBOMs
- `msrd.yml` — produces the Memory-State Readiness Document on tag

---

## MCP server (read-only & writable)

Expose the memory as tools for any MCP-compatible client (Copilot, Claude Desktop, Cursor, etc.):

```bash
# read-only (default — safe)
node cli/mcp-server/dist/server.js --cwd /path/to/project

# writable (mutating tools enabled)
node cli/mcp-server/dist/server.js --cwd /path/to/project --writable
```

Tools exposed:

- Read-only: `am.status`, `am.list_requirements`, `am.context_pack`, `am.graph`
- Writable (only with `--writable`): `am.create_requirement`, `am.update_status`, `am.append_event`, `am.ki_add`, `am.create_adr`

Build the server:

```bash
npm --prefix cli/mcp-server run build
```

---

### Consuming via npx (no install)

```bash
npx agent-mem@latest init
```

### Consuming via global install

```bash
npm i -g agent-mem
agent-mem --help
```

### Consuming via npm link (during framework dev)

```bash
git clone <this repo>
cd new
npm install
npm run cli:build
npm link -w agent-mem
agent-mem --version
```

### Container deployment (CI / sandboxed runners)

```dockerfile
FROM node:20-alpine
RUN npm i -g agent-mem
WORKDIR /work
ENTRYPOINT ["agent-mem"]
```

```bash
docker run --rm -v "$PWD:/work" agent-mem-runner doctor --json
```

### 2. Smoke-test the tarball locally

Verify what npm will actually ship before pushing:

```powershell
cd cli/agent-mem
npm pack                          # produces agent-mem-X.Y.Z.tgz
tar -tf agent-mem-*.tgz | Select-String -Pattern "templates/|dist/|README"
# expect: dist/cli.js, dist/index.js, templates/framework/**, templates/stacks/**, README.md
```

Install and run from the tarball in a scratch dir:

```powershell
mkdir $env:TEMP\am-smoke; cd $env:TEMP\am-smoke
npm init -y | Out-Null
npm i (Resolve-Path "$PSScriptRoot\..\..\new\cli\agent-mem\agent-mem-*.tgz")
npx agent-mem --version
npx agent-mem doctor --json
npx agent-mem init                # walk through scaffold
```

If the scaffold lands correctly, the tarball is good.


## Troubleshooting

| Symptom                                           | Fix                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check` fails on `verify:hashes`          | Run `npm run rebuild:hashes` after intentional memory edits, then re-commit.                                                                             |
| `ci:drift` reports drift                          | Either add the missing script to `package.json` or update `index.profiles.commands`.                                                                     |
| `agent-mem doctor` warns about missing AI surface | Re-run `agent-mem init` or scaffold the specific vendor file manually.                                                                                   |
| `bun add -g opencode-ai` exits 1                  | External bun bug on Windows — use `npx opencode-ai@latest` or `npm i -g opencode-ai` instead. See `docs/agent-memory/known-issues.md` (KI-0001 WONTFIX). |
| Autopilot does nothing useful                     | Set `AGENT_MEM_RUNNER` to a real agent runner; without it, autopilot only writes log stubs.                                                              |
| MCP write tools are missing                       | Pass `--writable` to `cli/mcp-server` and trust the client.                                                                                              |

For full diagnostics:

```bash
agent-mem doctor --json
```

---

## License

MIT. See individual package manifests for details.
