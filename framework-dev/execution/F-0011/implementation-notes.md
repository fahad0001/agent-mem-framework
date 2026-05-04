# Implementation Notes - F-0011

## Changed

- Added `skill.json` manifests to all shipped skills.
- Added `references/` documentation to all shipped skills for durable operational guidance.
- Extended `.github/scripts/skill-guard.mjs` to validate manifests and reference docs.
- Added `.github/scripts/agent-memory-build-folder-indexes.mjs` to generate and check folder-level memory indexes.
- Added root scripts `build:memory-indexes` and `validate:memory-indexes`, and included memory index validation in `npm run check`.
- Extended `docs/agent-memory/index.schema.json` and root `docs/agent-memory/index.json` with `folderIndexes`.
- Generated `docs/agent-memory/**/index.json` folder indexes.
- Updated AGENTS, Copilot instructions, index rules, and READMEs to prefer folder indexes for discovery.
- Synced framework templates and added scaffold assertions for manifests and folder indexes.

## Commands

- `npm run build:memory-indexes`: PASS.
- `npm run validate:skills`: PASS.
- `npm run validate:memory-indexes`: PASS.
- `npm run sync:framework -w @opair/ai-sdlc`: PASS.
- `npm run validate:schema`: PASS.
- `npm run typecheck -w @opair/ai-sdlc`: PASS.
- Focused `scaffold.test.ts`: PASS, 13 tests.
- CLI test suite: PASS, 75 tests.
- `npm run cli:build`: PASS.
- `npm run check`: PASS.
- VS Code diagnostics: PASS, no errors found.
