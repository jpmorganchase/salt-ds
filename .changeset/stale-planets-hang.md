---
"@salt-ds/lab": minor
---

Refactor Pill. It is now receives the label as children. Remove selectable and closable variants from Pill.

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
