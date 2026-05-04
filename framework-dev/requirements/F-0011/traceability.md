# Traceability - F-0011

| Requirement | Implementation                                                       | Validation                                                   |
| ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC1         | `.github/skills/*/skill.json`                                        | `npm run validate:skills`                                    |
| AC2         | `.github/skills/*/references/`                                       | `npm run validate:skills`                                    |
| AC3         | `.github/scripts/skill-guard.mjs`                                    | `npm run validate:skills`                                    |
| AC4         | `.github/scripts/agent-memory-build-folder-indexes.mjs`              | `npm run validate:memory-indexes`                            |
| AC5         | `docs/agent-memory/index.json` and `docs/agent-memory/**/index.json` | `npm run validate:schema`; `npm run validate:memory-indexes` |
| AC6         | `package.json` check script                                          | `npm run check`                                              |
| AC7         | `cli/ai-sdlc/templates/framework/**`                                 | `npm run sync:framework -w @opair/ai-sdlc`; scaffold tests   |
