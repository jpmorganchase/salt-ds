---
"@salt-ds/core": major
"@salt-ds/lab": major
---

Move `SplitLayout` from lab to core
Changes in `SplitLayout`

- Removed `FlexItem` wraps around `SplitLayout` children.
- `SplitLayout` uses children instead of left and right props.
- A console warning will be shown if more than 2 children are passed to the component.
