---
"@salt-ds/lab": minor
---

Added support for closable pills. Pills can now contain a close button that when triggered will call a function passed to the `onClose` prop.

```
const handleClose = () => {
  console.log("closed");
};

<PillNext onClose={handleClose}>Closable Pill</PillNext>
```
