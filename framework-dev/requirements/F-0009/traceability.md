# Traceability - F-0009

| Requirement | Implementation                                                                                                                        | Tests / Evidence                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| FR-1        | `cli/ai-sdlc/scripts/sync-framework.mjs` copies `docs/agent-logs`; synced `cli/ai-sdlc/templates/framework/docs/agent-logs/README.md` | `scaffold.test.ts` default capability test; `npm run check`              |
| FR-2        | AHC extraction uses the last marker pair in `sync-framework.mjs` and `src/engine/renderers.ts`                                        | `scaffold.test.ts` asserts `Evidence-or-Abstain` and `Ask, do not infer` |
| FR-3        | `src/commands/adopt.ts`, `src/cli.ts`, `src/engine/capability-filter.ts`                                                              | `scaffold.test.ts` adopt capability regression                           |
| FR-4        | `.github/skills/*/SKILL.md`; sync copies `.github/skills`                                                                             | `scaffold.test.ts` skill existence assertions                            |
| FR-5        | `AGENTS.md`, `.github/copilot-instructions.md`, `docs/agent-memory/anti-hallucination-block.md`                                       | `npm run check`                                                          |
| Quality     | `cli/ai-sdlc/tsconfig.json`, `cli/ai-sdlc/test/commands.test.ts`                                                                      | `npm run typecheck -w @opair/ai-sdlc`                                    |
