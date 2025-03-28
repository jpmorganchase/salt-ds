---
"@salt-ds/core": minor
---

Promote updated `DialogHeader` component to core. `DialogHeader`'s update follows our standardized header for container components and app regions, and it can be added to provide a structured header for dialog. The header includes a title and actions that follows our Header Block pattern.

- Fixed default `initialFocus` to close button (if used) as per accessibility guidance.
- Updated bottom padding of DialogHeader from `--salt-spacing-300` to `--salt-spacing-100`
- Updated close button position in `DialogHeader` to horizontally align with header icon using the new `actions` prop.
- Updated overflow border to be above and below `DialogContent` instead of below `DialogHeader` to make scrolling area more evident.
- Added `description` to `DialogHeader`. the description text is displayed just below the header.

```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogHeader
    header="Terms and conditions"
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
      Only Chase Cards that we determine are eligible can be added to the wallet.
  </DialogContent>
</Dialog>;
```

Prompted `OverlayHeader` component to core.

- Fixed default `initialFocus` to close button (if used) as per accessibility guidance.
- Updated close button position in `OverlayHeader` using the new `actions` prop.
- Added `description` to `OverlayHeader`. the description text is displayed just below the header.

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
