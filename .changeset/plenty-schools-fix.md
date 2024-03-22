---
"@salt-ds/lab": minor
---

Removed the `onClose` prop from `Overlay`, `onOpenChange` is now called for events that open/close the overlay.

```tsx
export const ControlledOverlay = () => {
  const [open, setOpen] = useState(false);
  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  return (
    <Overlay open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>Overlay Content</OverlayPanel>
    </Overlay>
  );
};
```
