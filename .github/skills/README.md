# Skills Contract

Skills in this repository are automation-first capability packs. A skill must not
be only a long instruction file when deterministic work can be handled by a
script.

## Required Layout

Each skill folder must contain:

- `SKILL.md`: concise routing, script catalog, and workflow rules.
- `skill.json`: machine-readable manifest for routing, scripts, references, and
  evaluation hints.
- `references/`: operational domain knowledge loaded on demand.
- `scripts/`: at least three deterministic scripts for discovery, static checks,
  parsing, transforms, scaffolds, reports, or format-specific helpers.
- `templates/` or `checklists/` only when reusable output structure is needed.

## Rules

- Prefer scripts for repeatable inspection, file enumeration, hashing,
  graph/export generation, and boilerplate production.
- Keep `SKILL.md` short. It should tell the agent when to use the skill, which
  scripts to run first, and what evidence to report.
- Scripts must be safe by default: read-only unless their name or arguments
  clearly say they write output.
- Script output must be structured text or JSON whenever practical.
- `skill.json` is the script/agent lookup layer; `SKILL.md` is the concise human
  workflow layer.
- Every shipped script must be declared in `skill.json` with a purpose and output
  shape.
- Use `references/` for durable operational knowledge; do not create
  design-rationale files that the workflow does not use.
- If a user request is ambiguous and changes scope, ask questions before
  choosing defaults.
