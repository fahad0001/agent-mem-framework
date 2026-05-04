# Rollback Plan - F-0010

- Remove `.github/scripts/skill-guard.mjs` and the root `validate:skills` check wiring.
- Restore previous `SKILL.md` bodies from version control.
- Remove skill `scripts/` folders if the automation-first contract is rejected.
- Re-run framework sync to restore template parity.
