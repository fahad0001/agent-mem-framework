# Slide Design Rules

## Layout Principles

- **One column for text, one for visual** — split layout. Avoid wall-of-text slides.
- **Left-align body text** — center only slide titles.
- **Maintain ≥ 0.5" margins** on all sides and ≥ 0.3" gaps between content blocks.
- **Vary layouts** — never use the same title-plus-bullets pattern twice in a row.
- **Every slide needs at least one visual** — chart, diagram, icon, screenshot, or colored shape block. Text-only slides lose attention within 10 seconds.

---

## Typography

| Element         | Recommended size | Weight           |
| --------------- | ---------------- | ---------------- |
| Slide title     | 28–36 pt         | Bold             |
| Body text       | 18–22 pt         | Regular          |
| Caption / label | 14–16 pt         | Regular or Light |
| Data callout    | 40–60 pt         | Bold             |

- Use at most **two font families** per deck: one for headings, one for body.
- Avoid decorative fonts for body text — they reduce readability at small sizes.

---

## Color

- Pick a palette tied to the topic or brand — not generic corporate blue.
- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text (≥ 18pt bold).
- Use a single accent color for emphasis. More than two accent colors creates visual noise.
- Dark-on-light is preferred for text-heavy slides. Light-on-dark works for impact slides with a single large callout.

---

## Charts and Data

- Label data points directly on the chart — do not force the audience to read a legend.
- Highlight the single most important bar / line / value using the accent color.
- Remove gridlines unless they are needed for reading specific values.
- Always include units (%, ms, count) in the axis label or title.
- Do not use 3D charts — they distort proportions.

---

## Diagrams and Architecture

- Use `<SKILL_DIR>/scripts/build-deck-outline.mjs` to extract an outline from source Markdown before drawing.
- Keep architecture diagrams to ≤ 7 components per slide. Split complex systems across multiple slides.
- Use consistent shapes: rectangles for services, cylinders for storage, parallelograms for external systems.
- Arrows show data flow direction. Label arrows with the protocol or payload name.

---

## QA Before Done

Run through this checklist before declaring done:

- [ ] No placeholder text remains (XXXX, Lorem, TODO, TBD)
- [ ] No text is clipped or overlapping the slide edge
- [ ] Headline on every slide is a full assertion, not a topic label
- [ ] Each slide has at most one primary idea
- [ ] All claims have a source or are marked as estimates
- [ ] Speaker notes exist for every live-delivery slide
- [ ] Slide count matches the timebox (1 slide per 1.5–2 minutes for live delivery)
