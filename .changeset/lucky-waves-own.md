---
"@salt-ds/core": minor
---

Add `Drawer` and `DrawerCloseButton` to core
Drawer is an expandable panel that displays content and controls over the application content. It provides temporary access to additional or related content without navigating away from the current screen.

```tsx
export const Default = (): ReactElement => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);

  return (
    <>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
        style={{ width: 200 }}
      >
        Drawer Content
        <DrawerCloseButton onClick={() => setOpenPrimary(false)} />
      </Drawer>
    </>
  );
};
```
