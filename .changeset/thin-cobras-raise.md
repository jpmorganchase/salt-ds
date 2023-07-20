---
"@salt-ds/lab": minor
---

Add PillNext

Changes from Pill API: `label` prop should be passed in as children
Removed selectable and closable variants from Pill

```tsx
<Pill onClick={handleClick}>
    Pill
</Pill>


<Pill icon={<FavoriteIcon/>} onClick={handleClick}>
    Pill With Icon
</Pill>
```
