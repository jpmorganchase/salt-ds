---
"@salt-ds/icons": minor
---

Added `saltIcons.css` with all icon SVGs as background images.

```js
import "@salt-ds/icons/saltIcons.css";

const Example = () => {
  const iconName = "AddDocument";
  return <div className={`saltIcon-${iconName}`} />;
};
```
