---
"@salt-ds/core": minor
"@salt-ds/lab": minor
---

Move `SplitLayout` from lab to core
Changes in `SplitLayout`

- Removed `FlexItem` wraps around `SplitLayout` children.
- `SplitLayout` uses `startItem` and `endItem` props as children to allow for direction.
- Added `direction` prop to `SplitLayout`.
- Remove `wrap` since `SplitLayout` has `direction` to control wrap by breakpoints.
- End Aligned `endItem` so the element is always at the end of the layout.
