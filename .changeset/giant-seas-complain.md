---
"@salt-ds/lab": minor
---

- Refactored `Drawer` to use floating-ui and Salt's `Scrim`.
- Added optional `DrawerCloseButton`.
- Implemented desktop support.

```tsx
export const DrawerTemplate = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        id="DRAWER_ID"
        style={{ width: 300 }}
      >
        <DrawerCloseButton onClick={handleClose} />
        <H2>Title</H2>
        <Text>Content of drawer</Text>
      </Drawer>
    </>
  );
};
```
