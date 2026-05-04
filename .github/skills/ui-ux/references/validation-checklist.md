# UI/UX Validation Checklist

## 1. Heuristic Evaluation (Nielsen's 10)

| #   | Heuristic                               | Check                                                                                            |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Visibility of system status             | Does the UI always tell the user what is happening? (loading indicators, progress, confirmation) |
| 2   | Match between system and real world     | Does the language match the user's vocabulary — not internal system jargon?                      |
| 3   | User control and freedom                | Can the user undo, cancel, or go back from every state?                                          |
| 4   | Consistency and standards               | Do similar actions look and behave the same across the product?                                  |
| 5   | Error prevention                        | Does the UI prevent errors before they happen (e.g. disabled submit until form is valid)?        |
| 6   | Recognition over recall                 | Are options visible rather than requiring the user to remember them?                             |
| 7   | Flexibility and efficiency              | Are there shortcuts or accelerators for power users?                                             |
| 8   | Aesthetic and minimalist design         | Does every element serve a purpose? Is anything purely decorative or distracting?                |
| 9   | Help users recognize, diagnose, recover | Do error messages explain what went wrong and how to fix it?                                     |
| 10  | Help and documentation                  | Is help available when needed without leaving the task?                                          |

---

## 2. State Coverage (required for every feature surface)

| State                   | Check                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| Loading                 | Is a skeleton or spinner shown while data is fetched?              |
| Empty                   | Is there a meaningful empty-state message with a call to action?   |
| Success                 | Does the user receive clear confirmation after an action?          |
| Error                   | Is the error message actionable — not just "something went wrong"? |
| Partial / degraded      | What does the user see when only some data is available?           |
| Permission-limited      | Are features gracefully hidden or disabled for unauthorized users? |
| Offline / network error | Is the user informed and given a path to retry?                    |

---

## 3. Accessibility Checks

- All interactive elements have accessible names (visible label, `aria-label`, or `aria-labelledby`)
- Focus order is logical — keyboard users can reach all interactive elements in document order
- Contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text (≥ 18pt or 14pt bold)
- No information is conveyed by color alone
- All images have meaningful `alt` text (or `alt=""` for decorative images)
- Forms: every input has a visible label; error messages are associated with the input via `aria-describedby`
- Modal dialogs trap focus correctly; closing returns focus to the trigger

---

## 4. Responsive Checks

| Breakpoint           | Minimum checks                                            |
| -------------------- | --------------------------------------------------------- |
| Mobile (320–480 px)  | No horizontal scroll; tap targets ≥ 44×44 px; text ≥ 16px |
| Tablet (481–1024 px) | Layout adapts (not just scaled down mobile)               |
| Desktop (1025+ px)   | Content is readable without horizontal scroll at 1280px   |

---

## 5. Copy and Microcopy

- Button labels are verbs describing the action ("Save changes", not "Submit")
- Error messages say what went wrong and what the user should do next
- Placeholder text is not a substitute for a visible label
- Success messages confirm the specific action taken ("Profile saved", not "Done")
- Destructive actions have a clear warning and a confirmation step
