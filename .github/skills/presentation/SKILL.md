---
name: presentation
description: Presentation authoring skill. Covers creating structured decks from scratch, converting existing Markdown or documents into slide outlines, writing speaker notes, building executive briefings, technical walkthroughs, demo scripts, and roadmap decks. Use when the user mentions "deck", "slides", "presentation", "speaker notes", "pitch deck", "executive briefing", "walkthrough", "roadmap presentation", or references any slide output format. Always applies a structured narrative arc and design rules before producing content. Claims must trace to sources; open facts are marked explicitly.
---

# Presentation Skill

## Quick Reference

| Task                               | What to do                                                                |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Build outline from Markdown source | Run `scripts/build-deck-outline.mjs` first                                |
| Lint a Markdown deck               | Run `scripts/lint-deck-outline.mjs` before delivery                       |
| Check referenced visuals           | Run `scripts/asset-inventory.mjs` before delivery                         |
| Inspect a PPTX                     | Run `python scripts/pptx-inspect.py deck.pptx --json`                     |
| Unpack / repack a PPTX             | Run `python scripts/unpack-pptx.py` then `python scripts/pack-pptx.py`    |
| Choose narrative arc               | Read `references/narrative-structure.md`                                  |
| Apply design rules                 | Read `references/slide-design.md`                                         |
| Write speaker notes                | Follow the template in `references/narrative-structure.md §Speaker Notes` |

---

## 0) Load References First

**Resolve `<SKILL_DIR>`** from the path used to load this file (replace `SKILL.md` with empty).

| Need                                                    | File                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Narrative arcs, audience types, one-idea-per-slide rule | `<SKILL_DIR>/references/narrative-structure.md`                          |
| Layout, typography, color, chart, and QA rules          | `<SKILL_DIR>/references/slide-design.md`                                 |
| Build outline from source Markdown                      | `<SKILL_DIR>/scripts/build-deck-outline.mjs`                             |
| Lint outline quality                                    | `<SKILL_DIR>/scripts/lint-deck-outline.mjs`                              |
| Inventory referenced visuals                            | `<SKILL_DIR>/scripts/asset-inventory.mjs`                                |
| Inspect PPTX text/media                                 | `<SKILL_DIR>/scripts/pptx-inspect.py`                                    |
| Unpack and repack PPTX archives                         | `<SKILL_DIR>/scripts/unpack-pptx.py`, `<SKILL_DIR>/scripts/pack-pptx.py` |

---

## 1) Choose a Workflow

### A — Build from Source (Markdown, docs, or memory)

Use when: a body of existing content exists and needs shaping into slides.

1. Extract the outline:
   ```bash
   node <SKILL_DIR>/scripts/build-deck-outline.mjs --input=<source.md> --json
   ```
   With a file output:
   ```bash
   node <SKILL_DIR>/scripts/build-deck-outline.mjs --input=<source.md> --out=outline.json
   ```
2. Read `references/narrative-structure.md` — choose the arc (A, B, or C) that fits
3. Map source content to arc slots — merge or cut ruthlessly
4. Apply slide design rules from `references/slide-design.md`
5. Write speaker notes for live-delivery slides
6. Run QA (§2)

Run the mechanical checks before final delivery:

```bash
node <SKILL_DIR>/scripts/lint-deck-outline.mjs --input=<deck.md> --json
node <SKILL_DIR>/scripts/asset-inventory.mjs --input=<deck.md> --json
```

### B — Build from Scratch

Use when: no source document exists; the user describes what they need.

1. Identify: audience type, decision needed, timebox, delivery format (live / async / print)
2. Read `references/narrative-structure.md` — pick the arc
3. Draft slide titles as full assertions (not topic labels)
4. Fill each slide: one visual, supporting text that reinforces the title, not repeats it
5. Apply design rules from `references/slide-design.md`
6. Write speaker notes for live-delivery slides
7. Run QA (§2)

When the output is Markdown, run `lint-deck-outline.mjs` and `asset-inventory.mjs` before finalizing.

### C — Adapt or Review an Existing Deck

Use when: a deck exists but needs restructuring, updating, or review.

1. Extract the outline from the existing structure:
   ```bash
   node <SKILL_DIR>/scripts/build-deck-outline.mjs --input=<existing.md> --json
   ```
2. Identify: which arc it uses (or should use), slide count vs timebox, headline quality
3. Flag slides that violate the one-idea rule
4. Flag claims with no traceable source
5. Propose a reordering or cut list before making changes
6. Run QA (§2)

For `.pptx` inputs, inspect before editing:

```bash
python <SKILL_DIR>/scripts/pptx-inspect.py <deck.pptx> --json
python <SKILL_DIR>/scripts/unpack-pptx.py <deck.pptx> <work-dir>
python <SKILL_DIR>/scripts/pack-pptx.py <work-dir> <output.pptx>
```

---

## 2) QA (Required Before Done)

**Assume there are problems. Find them before declaring done.**

- [ ] No placeholder text (XXXX, Lorem, TODO, TBD)
- [ ] Every headline is a full assertion, not a topic label
- [ ] Each slide has exactly one primary idea
- [ ] All claims trace to a source or are marked as estimates
- [ ] Slide count matches the timebox (≤ 1 slide per 1.5 minutes for live delivery)
- [ ] Speaker notes exist for every live-delivery slide
- [ ] Design rules from `references/slide-design.md` are satisfied
- [ ] `lint-deck-outline.mjs` passes for Markdown decks
- [ ] `asset-inventory.mjs` passes when visual assets are referenced
- [ ] `pptx-inspect.py` was run for PPTX inputs or outputs

Open facts must be listed explicitly — do not fill them with plausible-sounding guesses.

---

## 3) Output

Write slide content in Markdown (one `##` heading per slide). If a tool-native format is needed (`.pptx`, Reveal.js, etc.), note it explicitly and request clarification on tooling before starting.
