---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
---

### Button refactor

- Removed internal `<span/>` from `Button`, children are now direct children of the component.
- CSS Refactor to remove old browser support.
- fix `aria-disabled` to only show when not redundant.
- Added active visual style to `Button` when either `spacebar` or `enter`.
- Removed of `DivButton`. for lab components that used `DivButton`, it's been replaced by a `Button` (`Tab` and `Dropdown`) or a custom internal `div` (`Pill`).
