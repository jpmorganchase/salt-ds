---
"@salt-ds/core": patch
---

Fixed `VerticalNavigationItemTrigger` dropping its forwarded ref.

The internal action element was a plain function component, so the ref passed to `VerticalNavigationItemTrigger` never reached the rendered element on React 18 and below. This broke consumers that need the underlying node, such as wrapping the trigger in a `Tooltip`.

```tsx
<Tooltip content="Products" placement="right">
  <VerticalNavigationItemTrigger render={<Link to="/products" />}>
    <VerticalNavigationItemLabel>Products</VerticalNavigationItemLabel>
  </VerticalNavigationItemTrigger>
</Tooltip>
```
