---
"@salt-ds/lab": minor
---

- Refactored `Drawer` to use floating-ui and Salt's `Scrim`.
- Open prop set to false by default
- Fix to `Floating Components` implementation of focus manager props from Floating UI
- Added optional `DrawerCloseButton`.
- Added optional props `disableScrim` and `diableDismiss`

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
      <Drawer open={open} onOpenChange={onOpenChange} style={{ width: 300 }}>
        <DrawerCloseButton onClick={handleClose} />
        <H2>Title</H2>
        <Text>Content of drawer</Text>
      </Drawer>
    </>
  );
};
```
