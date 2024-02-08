---
"@salt-ds/core": minor
---

- Add `Dialog` to Core
- Added `disableScrim` as an optional component, to prevent the render of the Scrim in Desktop Environments

```tsx
const DesktopAlertDialog = () => {
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
        Click to open dialog
      </Button>
      <Dialog
        size={"small"}
        role="alertdialog"
        status={"error"}
        open={open}
        onOpenChange={onOpenChange}
        initialFocus={1}
        disableScrim
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete this transaction
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```
