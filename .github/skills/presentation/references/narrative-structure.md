# Narrative Structure Guide

## Core Arc

Every effective presentation has one arc. Choose the arc that fits the situation, then map your content to it.

---

## Arc A — Problem → Solution → Proof

Best for: technical proposals, architectural decisions, project kick-offs.

| Slot            | Content                                              |
| --------------- | ---------------------------------------------------- |
| 1. Context      | Where we are today (2–3 facts, not history)          |
| 2. Problem      | What is broken, constrained, or at risk              |
| 3. Root cause   | Why it is broken (the lever you can pull)            |
| 4. Solution     | What we are doing about it                           |
| 5. How it works | The one key mechanism, simply                        |
| 6. Proof        | Evidence that it works (metrics, demo, test results) |
| 7. Decision     | What you need the audience to do                     |

---

## Arc B — Situation → Complication → Resolution

Best for: executive briefings, incident retrospectives, status updates.

| Slot            | Content                                       |
| --------------- | --------------------------------------------- |
| 1. Situation    | Established context everyone agrees on        |
| 2. Complication | What changed or went wrong                    |
| 3. Question     | The question the audience is now asking       |
| 4. Answer       | Your resolution, recommendation, or next step |

Use the minimum number of supporting slides to make the answer credible.

---

## Arc C — Before → After → Bridge

Best for: product demos, feature launches, roadmaps.

| Slot      | Content                                               |
| --------- | ----------------------------------------------------- |
| 1. Before | Current user pain or manual process                   |
| 2. After  | The better world this feature creates                 |
| 3. Bridge | How to get there (timeline, investment, dependencies) |

---

## Audience Types

| Audience  | Length       | Depth                                  | Tone                                |
| --------- | ------------ | -------------------------------------- | ----------------------------------- |
| Executive | ≤ 10 slides  | Outcome-first, minimal detail          | Decisive, crisp                     |
| Technical | 15–25 slides | Architecture, trade-offs, evidence     | Precise, evidence-backed            |
| Mixed     | ≤ 15 slides  | Lead with outcome, appendix for detail | Clear headline + detail slide pairs |

---

## One Idea Per Slide

Each slide must have:

- A **headline** that is a full assertion (not just a topic label)
- **One** primary visual or data point
- Supporting text that reinforces — not repeats — the headline

Bad headline: "Performance"
Good headline: "Response time dropped 40% after cache refactor"

---

## Speaker Notes Template

For every slide where the speaker will narrate live:

```
[What to say]
Max 3 sentences covering the key insight.

[What to emphasize]
The one number, finding, or decision point that must land.

[Transition]
Bridge to the next slide.
```
