---
"@salt-ds/lab": minor
---

Added `OverlayPanelCloseButton` and `OverlayPanelContent` components as children of `OverlayPanel`

```tsx
export const OverlayWithCloseButton = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => setOpen(false);

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent>Overlay Content</OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
```
