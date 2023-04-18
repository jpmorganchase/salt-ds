---
"@salt-ds/core": minor
---

Add mergeProps to utils.

This utility merges two prop objects according to the following rules:

- If the prop is a function and begins with "on" then chain the functions together
- If the prop key is "className" then merge them using `clsx`
- If the prop is anything else, then use the value from the second parameter unless it's undefined then use the value from the first parameter
