---
"@salt-ds/core": minor
---

Promote updated `DialogHeader` component to core. `DialogHeader`'s update follows our standardized header for container components and app regions, and it can be added to provide a structured header for dialog. The header includes a title and actions that follows our Header Block pattern.

- Fixed default `initialFocus` to close button (if used) as per accessibility guidance.
- Updated bottom padding of DialogHeader from `--salt-spacing-300` to `--salt-spacing-100`
- Updated close button position in `DialogHeader` to horizontally align with header icon using the new `actions` prop.

```typescript
<Dialog open={open} onOpenChange={onOpenChange} id={id}>
  <DialogHeader
    header={<H2>Terms and conditions</H2>}
    actions={
      <Button
        aria-label="Close overlay"
        appearance="transparent"
        sentiment="neutral"
      >
        <CloseIcon aria-hidden />
      </Button>
    }
  />
  <DialogContent>
    <div>
      Only Chase Cards that we determine are eligible can be added to the
    Wallet.
    </div>
  </DialogContent>
</Dialog>;
```

Prompted `OverlayHeader` component to core.

```tsx
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
          <CloseIcon aria-hidden />
        </Button>
      }
    />
    <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
  </OverlayPanel>
</Overlay>
```
