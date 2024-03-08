---
"@salt-ds/core": minor
---

Add `Overlay`, `OverlayTrigger` and `OverlayPanel` to core

```tsx
export const Default = (): ReactElement => {
  const id = useId();
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <H3 id={id}>Title</H3>
        Content of Overlay
      </OverlayPanel>
    </Overlay>
  );
};
```
