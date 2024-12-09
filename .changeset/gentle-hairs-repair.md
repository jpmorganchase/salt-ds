---
"@salt-ds/lab": patch
---

Updates to Lab `SkipLink`

- Deprecated `targetRef` prop, added `target` prop to accept a string representing the ID of the target element.
- Updated styling to adhere with the rest of the library styles for consistency.
- Fixed an issue where the `SkipLink` would render when the ref to the target element was broken. Now, the skip link will not render at all if the target element is not found.
