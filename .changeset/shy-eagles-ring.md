---
"@salt-ds/core": patch
---

- Enhanced `FlexLayout`, `StackLayout` and `SplitLayout` components by extending `LayoutDirection` to support both `column-reverse` and `row-reverse` directions, providing more flexible layout options.
- The Responsive props in Layout components now support reversing the order of items.
```tsx
direction={{ xs: "column-reverse", sm: "row-reverse" }}
```
