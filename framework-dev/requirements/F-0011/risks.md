# Risks - F-0011

- R1: Generated folder indexes can become stale.
  - Mitigation: add `validate:memory-indexes` and include it in `npm run check`.
- R2: Skill research could become copied content instead of inspiration.
  - Mitigation: require `references/` and verify shipped scripts are declared in `skill.json`.
- R3: Agents may ignore machine indexes.
  - Mitigation: update AGENTS, Copilot instructions, and index rules to prefer folder indexes for discovery.
