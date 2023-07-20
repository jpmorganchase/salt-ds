---
"@salt-ds/lab": minor
---

Refactor Pill API: label should be passed in as children
Removed selectable and closable variants from Pill

```tsx
<Pill onClick={handleClick}>
    Pill
</Pill>

<Pill disabled onClick={handleClick}>
    Disabled Pill
</Pill>

<Pill icon={<FavoriteIcon/>} onClick={handleClick}>
    Pill With Icon
</Pill>
```
