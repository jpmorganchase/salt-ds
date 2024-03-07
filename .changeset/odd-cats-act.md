---
"@salt-ds/icons": minor
---

Added `saltIcons.css` with all icons SVG as background image.

```js
import "@salt-ds/icons/saltIcons.css";

const Example = () => {
  const iconName = `AddDocument`;
  return <div className={`saltIcon-${iconName}`} />;
};
```
