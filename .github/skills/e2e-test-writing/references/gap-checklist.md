# Gap Checklist — What to Cover for Any Requirement

For each acceptance criterion in scope, expand it using the dimensions below. A scenario is required for each dimension unless the AC explicitly excludes it.

---

## Functional Dimensions

| Dimension           | Question to ask                                              | Example scenario title                                      |
| ------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Happy path          | Does the primary flow succeed end-to-end?                    | `User saves a valid form and sees confirmation`             |
| Empty state         | What does the user see when there is no data?                | `Dashboard shows empty-state message when no items exist`   |
| Validation error    | What happens when the user submits bad data?                 | `Form shows inline error when email field is blank`         |
| Permission boundary | What happens when the user lacks access?                     | `User without editor role cannot reach the settings page`   |
| Network error       | What happens when an API call fails?                         | `Error banner appears when save request returns 500`        |
| Concurrent action   | Does the feature work if another action runs simultaneously? | `Second save does not corrupt first while first is pending` |

---

## Non-Functional Dimensions

| Dimension            | When to include                                                |
| -------------------- | -------------------------------------------------------------- |
| Accessibility (a11y) | Always — keyboard navigation and screen-reader labels          |
| Responsive behavior  | When the feature renders on multiple breakpoints               |
| Performance budget   | When the AC specifies a latency ceiling (e.g. "loads in < 2s") |

---

## Prioritization

| Priority        | When to apply                                               |
| --------------- | ----------------------------------------------------------- |
| P0 — Smoke      | The single most important happy-path scenario               |
| P1 — Core       | All other happy-path and error-state scenarios              |
| P2 — Edge       | Boundary values, concurrent actions, data limits            |
| P3 — Robustness | Retries, degraded network, long strings, special characters |

Run P0 first in CI. Fail fast — do not run P1–P3 if P0 is red.
