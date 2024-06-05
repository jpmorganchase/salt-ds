---
"@salt-ds/core": minor
---

Added `icon` prop to Toast to allow for a custom icon

```tsx
<Toast icon={<InfoIcon />} status={"info"}>
  <ToastContent>
    <Text>
      <strong>Info with Custom Icon</strong>
    </Text>
    <div>Filters have been cleared</div>
  </ToastContent>
</Toast>
```
