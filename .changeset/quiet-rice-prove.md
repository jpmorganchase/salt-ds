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
    <OverlayHeader
      id={id}
      header="Title"
      actions={
        <Button
          aria-label="Close overlay"
          appearance="transparent"
          sentiment="neutral"
        >
          <CloseIcon aria-hidden/>
        </Button>
      }
    />
    <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
  </OverlayPanel>
</Overlay>
```
