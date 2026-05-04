# Validation Plan - F-0011

- Run `npm run validate:skills`.
- Run `npm run build:memory-indexes`.
- Run `npm run validate:memory-indexes`.
- Run `npm run validate:schema`.
- Run `npm run sync:framework -w @opair/ai-sdlc`.
- Run `npm run typecheck -w @opair/ai-sdlc`.
- Run focused scaffold tests and full CLI tests.
- Run `npm run cli:build`.
- Run `npm run check`.
