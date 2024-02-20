---
"@salt-ds/core": minor
---

- Promote `Dialog`, `DialogTitle`, `DialogContent` and `DialogActions` to Core
- `Dialog` is a window that opens over the application content, focusing the user’s attention on a particular task or piece of information.
- It can communicate new information, errors, warnings, or successful completion of a process or task

```tsx
const AlertDialog = () => {
  const [open, setOpen] = useState(openProp);
  const id = useId("alertDialog");

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    // setOpen(value)
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Click to open dialog</Button>
      <Dialog
        size={"small"}
        role="alertdialog"
        status={"error"}
        open={open}
        onOpenChange={onOpenChange}
        initialFocus={1}
        disableDismiss
        aria-labelledby={id}
      >
        <DialogTitle id={id}>Delete Transaction</DialogTitle>
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
