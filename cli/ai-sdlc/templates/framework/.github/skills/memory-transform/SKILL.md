---
name: memory-transform
description: Agent memory transformation skill. Converts the indexed agent memory into navigable representations including Obsidian vaults with backlinks, Mermaid dependency and status graphs, Graphviz DOT files, and static dashboards. Use when the user wants to visualize requirements, browse memory in Obsidian, generate a status graph, export a dependency diagram, produce a memory report, or navigate agent memory in any graphical format. Never mutates the canonical memory under docs/agent-memory/ — all output goes to a separate path.
---

# Memory Transform Skill

## Overview

Converts indexed agent memory (`docs/agent-memory/index.json`) into navigable output formats. The canonical memory is never modified — all generated files go to a separate destination.

---

## 0) References and Scripts

**Resolve `<SKILL_DIR>`** from the path used to load this file (replace `SKILL.md` with empty).

| Need                                                        | File                                          |
| ----------------------------------------------------------- | --------------------------------------------- |
| Mermaid, DOT, and Obsidian conventions and output structure | `<SKILL_DIR>/references/format-guide.md`      |
| Export memory to any supported format                       | `<SKILL_DIR>/scripts/export-memory-graph.mjs` |
| Write a Markdown status report                              | `<SKILL_DIR>/scripts/memory-report.mjs`       |
| Export an Obsidian vault                                    | `<SKILL_DIR>/scripts/obsidian-vault.mjs`      |
| Generate a static dashboard                                 | `<SKILL_DIR>/scripts/memory-dashboard.mjs`    |

Read the format guide before running an export — it explains the exact output structure, node conventions, and linking patterns for each format.

---

## 1) Choose a Format

| Format          | Command                                                                      | Best for                                |
| --------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| Mermaid         | `node <SKILL_DIR>/scripts/export-memory-graph.mjs --format=mermaid`          | Status overviews, quick diagrams        |
| DOT (Graphviz)  | `node <SKILL_DIR>/scripts/export-memory-graph.mjs --format=dot --out=<path>` | Richer layouts, cluster grouping        |
| Obsidian vault  | `node <SKILL_DIR>/scripts/obsidian-vault.mjs --out=<dir>`                    | Browsable knowledge base with backlinks |
| Markdown report | `node <SKILL_DIR>/scripts/memory-report.mjs --out=<path>`                    | Human-readable status digest            |
| HTML dashboard  | `node <SKILL_DIR>/scripts/memory-dashboard.mjs --out=<path>`                 | Standalone browser view                 |

Full command options:

```bash
# Mermaid — print to stdout
node <SKILL_DIR>/scripts/export-memory-graph.mjs --format=mermaid

# Mermaid — write to file
node <SKILL_DIR>/scripts/export-memory-graph.mjs --format=mermaid --out=docs/reports/memory-graph.md

# DOT — write to file and render with Graphviz
node <SKILL_DIR>/scripts/export-memory-graph.mjs --format=dot --out=docs/reports/memory.dot
dot -Tsvg docs/reports/memory.dot -o docs/reports/memory.svg

# Obsidian vault
node <SKILL_DIR>/scripts/obsidian-vault.mjs --out=docs/reports/obsidian-vault/

# Markdown report
node <SKILL_DIR>/scripts/memory-report.mjs --out=docs/reports/memory-report.md

# Static dashboard
node <SKILL_DIR>/scripts/memory-dashboard.mjs --out=docs/reports/memory-dashboard.html

# Use a different index file
node <SKILL_DIR>/scripts/export-memory-graph.mjs --format=mermaid --index=<path-to-index.json>
```

---

## 2) After Export

1. Tell the user exactly what files were generated and where
2. If the format is Mermaid: render inline if the output channel supports it, otherwise provide the file path
3. If the format is DOT: tell the user how to render it (`dot -Tpng`, or paste into graphviz.online)
4. If the format is Obsidian: tell the user to open `<output-dir>` as an Obsidian vault

---

## 3) Reading Memory for Reports

When the user asks for a narrative report or dashboard summary (not a graph):

1. Read `docs/agent-memory/index.json` for the top-level structure
2. Read folder-level `docs/agent-memory/**/index.json` files for per-folder artifact lists
3. Read `docs/agent-memory/08-progress-index.md` for the human-readable status table
4. Synthesize — do not copy raw JSON into the report; transform it into readable prose or tables

The canonical memory is the source; never invent status, dates, or links.

---

## 4) Canonical Memory Rules

- **Never write to** `docs/agent-memory/` as part of a transform
- Output only to `docs/reports/`, a user-specified path, or an explicit temp location
- List all generated files in the skill output so the user knows what was created
