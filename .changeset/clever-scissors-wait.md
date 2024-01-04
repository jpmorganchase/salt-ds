---
"@salt-ds/lab": minor
---

Update Overlay to use floating-ui. Supports placement on top (default), right, bottom, and left.

```tsx
const OverlayContent = () => {
  const { id } = useOverlayContext();

  return (
    <>
      <h3 id={`${id}-header`}>Title</h3>
      <div id={`${id}-content`}>Content of Overlay</div>
    </>
  );
};

const OverlayTemplate = (props: OverlayProps) => {
  const { style, ...rest } = props;

  return (
    <Overlay {...rest}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel style={style}>
        <OverlayContent />
      </OverlayPanel>
    </Overlay>
  );
};
```
