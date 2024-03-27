---
"@salt-ds/core": minor
---

Add `Overlay`, `OverlayTrigger`, `OverlayPanel`, `OverlayPanelContent` and `OverlayPanelCloseButton` to core

```tsx
export const DefaultOverlay = () => {
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelContent>Overlay Content</OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
```
