---
"@salt-ds/core": patch
---

Improved the accessibility of Switch by applying `role="switch"`.

**Note:** This might affect tests where you are targeting Switch by its role. For example, using React Testing Library-based selectors, tests will have to be updated like the following:

```diff
- getByRole("checkbox")
+ getByRole("switch")
```
