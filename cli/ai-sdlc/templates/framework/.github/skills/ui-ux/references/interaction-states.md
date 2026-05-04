# Interaction States Reference

## Why States Matter

Every feature surface has multiple states. A UI that only handles the happy path is incomplete. This reference maps states to design patterns.

---

## Loading States

**Skeleton screens** — preferred for content that has a predictable shape:

- Show placeholder shapes that match the real content layout
- Do not show a spinner inside a skeleton; pick one
- Animate with a shimmer or pulse (not a spinning indicator — that implies unknown duration)

**Spinners** — for actions with unknown duration (file upload, long computation):

- Use inside a button or a contained area, not full-page unless truly blocking
- Always pair with a text label ("Uploading…", "Saving…")

**Progress indicators** — for operations with measurable stages:

- Show percentage or step count ("Step 2 of 4") when deterministic
- Show elapsed time only if expected duration is known

---

## Empty States

A good empty state:

1. Explains why it is empty (no items yet, no results, access restricted)
2. Tells the user what to do next
3. Includes a primary call to action when an action is available

Bad: "No data found."
Good: "You have no saved reports yet. Create your first report to see it here." + [Create Report] button

---

## Error States

| Error type          | Pattern                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Form validation     | Inline message below the field; field border turns red/error color; summary at top if > 3 errors |
| API / network error | Banner or toast at page level; message explains the problem; "Try again" button                  |
| Permission error    | Explain what is restricted and why; link to request access if applicable                         |
| Not found           | 404 page with navigation back to a known-good location                                           |
| Timeout             | Distinguish from a generic error; offer retry with context preserved                             |

Error messages must never:

- Show a raw exception or stack trace to the user
- Say only "Error" or "Something went wrong" without guidance
- Require the user to contact support as the first step

---

## Disabled States

- Disabled controls must be visually distinguishable (lower opacity, different cursor)
- A disabled button must have a visible reason nearby or a tooltip explaining why
- Never use `disabled` attribute on a control without communicating the reason in context

---

## Focus and Keyboard States

- Every focusable element must have a visible focus ring (not hidden with `outline: none`)
- Focus ring must meet 3:1 contrast ratio against adjacent colors
- Tab order must match visual reading order
- Keyboard shortcut hints are shown in tooltips or help panels when shortcuts exist

---

## Responsive State Changes

Document these explicitly in prototypes and guides:

- What collapses to a drawer or bottom sheet on mobile?
- What truncates and needs a "show more" control?
- What pagination changes to infinite scroll?
- What multi-column layout becomes single-column?
