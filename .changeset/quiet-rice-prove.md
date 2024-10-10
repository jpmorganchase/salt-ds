---
"@salt-ds/lab": minor
---

Added `OverlayHeader` component to lab.

```typescript
  <Overlay {...args}>
    <OverlayTrigger>
      <Button>Show Overlay</Button>
    </OverlayTrigger>
    <OverlayPanel aria-labelledby={id}>
        <OverlayHeader id={id} header="Title" actions={<CloseButton />}/>
        <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
    </OverlayPanel>
  </Overlay>
```
