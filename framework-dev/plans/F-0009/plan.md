# Plan - F-0009

## Scope

- Fix missing scaffold validation files.
- Add requested skills to the shipped framework template.
- Apply capability filtering to `adopt`.
- Strengthen clarification and AHC instructions.
- Add focused regression tests.

## Non-scope

- New dependency or plugin system for skills.
- New memory export CLI command.
- Changes to consumer requirement schema.

## Approach

Update canonical sources first, then run the framework sync so templates and neutral YAML stay derived from source. Validate with targeted tests, full CLI tests, build, and root checks.
