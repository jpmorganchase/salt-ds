---
"@salt-ds/lab": minor
---

Update Overlay to use floating-ui. Supports placement on top (default), right, bottom, and left.

```tsx
const OverlayContent = (
  <>
    <h3 id="overlay_label">Title</h3>
    <div id="overlay_description">Content of Overlay</div>
  </>
);

<Overlay
  content={<OverlayContent />}
  placement="right"
  aria-labelledby="overlay_label"
  aria-describedby="overlay_description"
  {...props}
>
  <Button>Show Overlay</Button>
</Overlay>;
```
