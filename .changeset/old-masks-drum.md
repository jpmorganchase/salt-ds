---
"@salt-ds/core": minor
---

A progress indicator gives the user an understanding of how long a system
operation will take. You should use it when the operation will take more
than a second to complete. Two components are available to accommodate
different layout constraints: `CircularProgress` and `LinearProgress`.

```tsx
    <LinearProgress aria-label="Download" value={50}/>
    <CircularProgress aria-label="Download" value={50} />
```
