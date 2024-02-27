---
"@salt-ds/lab": minor
---

- Convert `Dialog Title` to accept props instead of a composable api
- Optional Props `title` and `subtitle` added to `Dialog Title`
- `Dialog Title` no longer accepts children
- Optional `id` prop added to `Dialog` to announce the `title` and `subtitle` when using a screen reader

```tsx
export const Default = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>
        Open default dialog
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange} id={id}>
        <DialogTitle title="Terms and conditions" />
        <DialogContent>
          Dialog Content
          </StackLayout>
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
