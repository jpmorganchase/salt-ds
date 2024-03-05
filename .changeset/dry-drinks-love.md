---
"@salt-ds/core": minor
---

Add `Dialog`, `DialogHeader`, `DialogContent`, `DialogActions`, and `DialogCloseButton` to core
Add patch to update dialog imports and `DialogHeader` renaming in mosaic-content-editor package

```tsx
export const Dialog = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

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
        Open default dialog
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange} id={id}>
        <DialogHeader header="Terms and conditions" />
        <DialogContent>Dialog Content</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Accept
          </Button>
        </DialogActions>
        <DialogCloseButton onClick={handleClose} />
      </Dialog>
    </>
  );
};
```
