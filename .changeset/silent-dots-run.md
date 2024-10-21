---
"@salt-ds/core": minor
---

Added `render` prop to `Link`.
```tsx
<Link render={<CustomLinkImplementation />} />
<Link render={() => <CustomLinkImplementation />} />
```
