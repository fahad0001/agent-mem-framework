# Selector Ladder — User-Behavior First

Always try a higher rung before falling to a lower one. This ordering reflects the user's perspective and is the most resilient to UI refactors.

---

## Rung 1 — Role + Accessible Name (strongly preferred)

Why: this is how a screen-reader user reaches the element. If rung 1 works, assistive tech works, and the test survives CSS / DOM refactors.

**Playwright:**

```typescript
page.getByRole("button", { name: "Save" });
page.getByRole("combobox", { name: "Country" });
page.getByRole("dialog", { name: "Confirm deletion" });
page.getByRole("link", { name: /open in new tab/i });
```

**Cypress (with Testing Library):**

```javascript
cy.findByRole("button", { name: "Save" });
cy.findByRole("combobox", { name: "Country" });
```

Disambiguate by scoping to a container:

```typescript
await page
  .getByRole("dialog", { name: "Confirm deletion" })
  .getByRole("button", { name: "Delete" })
  .click();
```

---

## Rung 2 — Label, Placeholder, Title

```typescript
page.getByLabel("Email address");
page.getByPlaceholder("Search products…");
page.getByTitle("Expand all");
```

```javascript
cy.findByLabelText("Email address");
cy.findByPlaceholderText("Search products…");
```

---

## Rung 3 — Visible Text

```typescript
page.getByText("Please select a value");
page.getByText(/^No results found$/);
```

Use exact match or tight regex — avoid substrings that match multiple elements.

---

## Rung 4 — Data Attributes (structural fallback)

Use only when rungs 1–3 cannot uniquely identify the target (e.g. four panels with identical role and name).

```typescript
page.locator('[data-panel-id="filters"]');
```

Then query inside with rung 1–3.

---

## Rung 5 — Test IDs (last resort)

For containers with no semantic markup (SVG viewports, virtualised list roots).

```typescript
page.getByTestId("chart-area");
```

```javascript
cy.findByTestId("chart-area");
```

---

## Never

- CSS classes (`.btn-primary`, `.mantine-Button-root`)
- Positional selectors (`nth-child`, `:first-of-type`)
- Framework-generated IDs (`#react-root`, `#_rid_3`)
- XPath — unless the tree has zero semantic markup AND no other option AND the user has accepted the trade-off

---

## Discovering Selectors

Always probe before authoring:

- Use `playwright_snapshot` (MCP) if available
- Or `page.accessibility.snapshot()` in a helper script
- Or browser DevTools → Accessibility panel

Never guess a selector by looking at rendered HTML class names.
