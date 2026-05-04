# Acceptance Criteria - F-0011

- AC1: Every shipped skill includes `skill.json` with triggers, scripts, references, and evaluation signals.
- AC2: Every shipped skill includes `references/` with durable operational guidance.
- AC3: `skill-guard.mjs` validates `skill.json`, `references/`, `SKILL.md`, and scripts.
- AC4: A deterministic script generates `docs/agent-memory/**/index.json` folder indexes.
- AC5: Root `docs/agent-memory/index.json` references generated folder indexes.
- AC6: `npm run check` validates skill manifests and memory folder-index freshness.
- AC7: Framework templates receive the same manifests, references, scripts, and folder indexes.
