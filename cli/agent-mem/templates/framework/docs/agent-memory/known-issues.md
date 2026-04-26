# Known issues / deferred bugs

> Backlog of non-blocking issues. Revisit in dedicated maintenance passes.
> Add new entries at the top. Each entry MUST include: ID, date, severity, scope, repro, suspected cause, deferred-because.

---

## KI-0002 — Several framework template overlays missing on disk _(RESOLVED)_

- **Date opened:** 2026-04-26
- **Date resolved:** 2026-04-27
- **Severity:** medium
- **Scope:** `cli/agent-mem/templates/framework/**`
- **Original repro:** Multiple expected overlay paths absent from disk although prior build/plan claimed them (14-threat-models/\*, 15-ai-evals, 16-observability, 17-release, dashboard.html, release/sbom/msrd workflows, scripts/ai-evals.mjs).
- **Verified root cause:** `cli/agent-mem/scripts/sync-framework.mjs` runs as the npm `prebuild` step. The previous implementation `rmSync`-ed the entire `templates/framework/` directory on every build and then copied only files that exist in the repo root (per `SOURCES`). Overlay-only files (`.github/workflows/release.yml`, `sbom.yml`, `msrd.yml`, `scripts/ai-evals.mjs`, `docs/agent-memory/dashboard.html`, and the entire `14-threat-models/`, `15-ai-evals/`, `16-observability/`, `17-release/` trees) had no canonical source under the repo root, so they were silently nuked on every `npm run build`. The earlier "stub-then-replace" workaround appeared to succeed only when no build ran between the two writes — it was a coincidence, not a fix.
- **Permanent fix:** `sync-framework.mjs` now performs an additive merge — it ensures `TEMPLATE_ROOT` exists and copies each `SOURCES` entry on top of it, but it never deletes anything. Stale files from removed sources are accepted; future cleanup can be done with an explicit prune step. Verified by running `npm --prefix cli/agent-mem run build` and confirming all 27 overlay files plus `dashboard.html` survive across rebuilds.
- **Permanent guard:** Unit test `scaffold.test.ts > emits restored framework overlays (KI-0002 closure)` enumerates 16 critical overlay paths and asserts existence after scaffolding into a tmp dir.
- **Acceptance check:** All overlay paths persist under `cli/agent-mem/templates/framework/` after multiple consecutive builds, contain real content, and the smoke test passes (`npm run cli:test` -> 37/37 green; `npm run check` -> all gates green).

---

## KI-0001 — `bun add -g opencode-ai` exits non-zero

- **Date:** 2026-04-26
- **Severity:** low
- **Scope:** developer environment (Windows, bun ≥ 1.0)
- **Repro:**
  ```
  bun add -g opencode-ai
  # exit code 1
  ```
- **Suspected cause:** unknown — could be bun global registry path, network/proxy, or platform binary missing for `opencode-ai`. Workaround: `npx opencode-ai@latest` or `npm i -g opencode-ai`.
- **Deferred because:** the framework only emits opencode config files (`.opencode/agent/*`, `opencode.json`) — it does not require the CLI to be installed on the dev machine to scaffold. Validate when investigating opencode runtime integration.
- **Acceptance for fix:** root cause identified, documented in `docs/agent-memory/16-observability/runbooks/` or scaffold pre-flight check warns + suggests fallback.

---

<!-- Template:
## KI-XXXX — <one-line title>

- **Date:** YYYY-MM-DD
- **Severity:** low | medium | high
- **Scope:** <area>
- **Repro:**
  ```
  <commands>
  ```
- **Suspected cause:** <hypothesis>
- **Deferred because:** <why it's safe to defer now>
- **Acceptance for fix:** <what "fixed" looks like>
-->
