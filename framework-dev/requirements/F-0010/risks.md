# Risks - F-0010

- R1: Validator could be too strict and block useful future skill formats.
  - Mitigation: enforce only the minimum contract needed for automation-first skills.
- R2: Scripts could drift from the skill instructions.
  - Mitigation: validator requires `SKILL.md` to mention at least one shipped script.
- R3: Generated projects could miss the validator script.
  - Mitigation: sync filter explicitly includes `.github/scripts/skill-guard.mjs` and scaffold tests assert it exists.
