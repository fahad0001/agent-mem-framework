# Traceability - F-0010

| Requirement | Implementation                                              | Validation                                                 |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| AC1         | `.github/skills/*/SKILL.md`                                 | `npm run validate:skills`                                  |
| AC2         | `.github/skills/*/scripts/*.mjs`                            | `npm run validate:skills`                                  |
| AC3         | `.github/scripts/skill-guard.mjs`                           | `npm run validate:skills`                                  |
| AC4         | `package.json` check script                                 | `npm run check`                                            |
| AC5         | `cli/ai-sdlc/scripts/sync-framework.mjs` and template files | `npm run sync:framework -w @opair/ai-sdlc`; scaffold tests |
| AC6         | `cli/ai-sdlc/test/scaffold.test.ts`                         | CLI test suite                                             |
| AC7         | No dependency edits beyond scripts                          | package review and install-free test run                   |
