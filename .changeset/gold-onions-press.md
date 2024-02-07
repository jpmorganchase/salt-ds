---
"@salt-ds/lab": minor
---

- Refactored `Dialog` to use floating-ui and Salt's `Scrim`.
- Implement FloatingComponent for Desktop support
- Added optional `disableDismiss` prop to prevent a click away dismissing the dialog.
- Added a `size` prop which takes `small`, `medium` and `large`.

```tsx
const AlertDialog = () => {
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
        disableDismiss
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
