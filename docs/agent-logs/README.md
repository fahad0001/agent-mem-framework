# Agent Logs

This folder contains append-only logs written by each agent run.

## Naming convention

- `YYYY-MM-DD__R-XXXX__<agent>.md`

## Log requirements

Each log must include:

- Files read (PRE)
- Files created/changed (TASK)
- Commands run and results (if any)
- Decisions made (and ADR links if applicable)
- Next step recommendation

## Notes

- Do not store large binary logs here.
- Keep logs factual and evidence-based.
