---
"@salt-ds/lab": patch
---

Add Toast component

- Add ToastContent component

```js
<Toast {...args}>
  <ToastContent>{children}</ToastContent>
  <Button variant="secondary">
    <CloseIcon />
  </Button>
</Toast>
```
