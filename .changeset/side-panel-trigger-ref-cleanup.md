---
"@salt-ds/core": patch
---

Fixed cleanup functions returned from callback refs, which are supported from React 19, not being called when the ref is passed to `getTriggerProps` from `useSidePanel`. The cleanup function now runs when the element is removed, instead of the ref being called with `null`.
