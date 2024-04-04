---
"@salt-ds/core": minor
---

Add `Overlay`, `OverlayTrigger`, `OverlayPanel`, `OverlayPanelCloseButton`, and `OverlayPanelContent` to core.

```tsx
export const DefaultOverlay = (): ReactElement => {
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
```
