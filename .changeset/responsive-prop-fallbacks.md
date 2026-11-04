---
"@salt-ds/core": patch
---

Fixed layout responsive props when no breakpoint in a responsive value matches, such as `{ md: "row" }` on a small screen.

- `StackLayout`'s `direction` falls back to `"column"`, instead of `FlexLayout`'s `"row"`.
- `gap` on `FlexLayout`, `StackLayout` and `GridLayout` falls back to its default of 3, instead of no gap.
- The `xs` breakpoint matches from the first render, so a server render uses `xs` values.
- In development, a warning flags a responsive value without an `xs` value. Below its smallest breakpoint, `GridLayout`'s `columns` and `rows` still have no value.

Layouts also no longer re-render every time a `SaltProvider` above them re-renders.
