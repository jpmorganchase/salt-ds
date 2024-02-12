---
"@salt-ds/core": minor
---

- Add `disableScrim` as an optional prop preventing the Scrim from being rendered. Use case is for in Desktop Environments

```tsx
const DesktopDialog = () => {
  const [open, setOpen] = useState(openProp);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open dialog without Scrim
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        id={"terms-and-conditions-dialog"}
        disableScrim
      >
        <DialogTitle disableAccent>Dialog without a Scrim</DialogTitle>
        <DialogContent>
          The Scrim is not rendered and the background remains visible
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```
