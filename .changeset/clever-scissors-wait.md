---
"@salt-ds/lab": minor
---

Update Overlay to use floating-ui. Supports placement on top (default), right, bottom, and left.

```tsx
const OverlayContent = (
  <>
    <h3>Title</h3>
    <div>Content of Overlay</div>
  </>
);

<Overlay content={<OverlayContent />} placement="right" {...props}>
  <Button>Show Overlay</Button>
</Overlay>;
```
