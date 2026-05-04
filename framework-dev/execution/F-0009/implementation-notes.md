# Implementation Notes - F-0009

## Changed

- `sync-framework.mjs` now copies `docs/agent-logs` and `.github/skills`, and expands the actual AHC block into copied template agents.
- AHC extraction now uses the last marker pair to avoid prose examples.
- `adopt` now accepts capability selectors and renders only core plus selected agents.
- Capability filtering covers `.opencode/agent/<id>.md`.
- Added six shipped skills: `pr-review`, `e2e-test-writing`, `ui-ux`, `presentation`, `ahc-evidence`, `memory-transform`.
- Strengthened clarification-before-defaulting rules.
- Added scaffold/adopt regression tests.
- Fixed the CLI typecheck config so tests included by `tsconfig.json` are inside `rootDir`, and removed a stale `@ts-expect-error`.

## Commands

- `npm run sync:framework -w @opair/ai-sdlc`: PASS.
- Focused `scaffold.test.ts` regressions: PASS, 2 tests.
- CLI tests: PASS, 75 tests.
- `npm run typecheck -w @opair/ai-sdlc`: PASS.
- `npm run cli:build`: PASS.
- `npm run check`: PASS.
