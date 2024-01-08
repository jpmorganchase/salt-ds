---
"@salt-ds/lab": minor
---

Update Overlay to use floating-ui. Supports placement on top (default), right, bottom, and left.

```tsx
const OverlayTemplate = (props: OverlayProps) => {
  const { style, ...rest } = props;
  const id = "salt-overlay";

  return (
    <Overlay id={id} {...rest}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel style={style}>
        <h3 id={`${id}-header`}>Title</h3>
        <div id={`${id}-content`}>Content of Overlay</div>
      </OverlayPanel>
    </Overlay>
  );
};
```
