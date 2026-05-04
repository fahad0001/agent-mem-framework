# Alpha 5 Release Preparation Audit

## Scope

Prepared `@opair/ai-sdlc` for `0.1.0-alpha.5` publishing after the script-backed skill-suite upgrade.

## Changes

- Bumped root/private package metadata to `0.1.0-alpha.5`.
- Bumped `@opair/ai-sdlc` package metadata to `0.1.0-alpha.5`.
- Regenerated `package-lock.json` with `npm install --package-lock-only`.
- Changed CLI version reporting to read from the workspace package metadata instead of a hard-coded version string.

## Validation Evidence

- `runTests` for `cli/ai-sdlc/test`: PASS, 76 passed and 0 failed.
- `npm run typecheck -w @opair/ai-sdlc`: PASS.
- `npm run cli:build`: PASS.
- `npm run smoke -w @opair/ai-sdlc`: PASS, output `0.1.0-alpha.5`.
- `npm run check`: PASS.
- `npm pack --dry-run -w @opair/ai-sdlc --json`: PASS, package id `@opair/ai-sdlc@0.1.0-alpha.5`.

## Publish Status

Publishing requires npm registry authentication. `npm whoami` returned `E401 Unauthorized` before publish.
