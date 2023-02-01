---
"@salt-ds/core": major
"@salt-ds/lab": major
---

Move `SplitLayout` from lab to core
Changes in `SplitLayout`

- Removed `FlexItem` wraps around `SplitLayout` children.
- `SplitLayout` uses `startItem` and `endItem` props as children to allow for direction.
- Added `direction` prop to `SplitLayout`.
- Changed `wrap` property for `wrapAtBreakpoint` to control wrap by breakpoints.
- End Aligned `endItem` so the element is always at the end of the layout.
