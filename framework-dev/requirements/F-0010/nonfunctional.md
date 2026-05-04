# Nonfunctional Requirements - F-0010

- Validation must be deterministic and dependency-free.
- Skill scripts must be safe by default and read-only unless their arguments explicitly write generated output.
- Scripts should emit JSON when useful for downstream agent reasoning.
- The structure must stay small enough to be reviewable and easy to copy into generated projects.
