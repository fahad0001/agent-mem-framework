# Execution Strategy - F-0011

1. Inspect reusable skill-packaging patterns and adapt only the operational structure.
2. Add `skill.json` and `references/` to every shipped skill.
3. Extend `skill-guard.mjs` to validate manifests and reference docs.
4. Add a deterministic folder-index builder for `docs/agent-memory/**/index.json`.
5. Extend `docs/agent-memory/index.schema.json` for `folderIndexes`.
6. Update agent instructions and docs to prefer folder indexes for discovery.
7. Sync framework templates and validate.
