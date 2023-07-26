---
"@salt-ds/core": minor
---

Add Drawer.

A Drawer is an expandable panel that users can open and close with a sliding animation.

Use this component to display content as an overlay within the application layout. With Drawer, the user can view additional content without navigating away from the current screen.

```
const [open, setOpen] = useState(false);

const hide = () => setOpen(false);

const { getReferenceProps, getFloatingProps } = useDrawer({
 open,
 onOpenChange: setOpen,
});

<>
 <Button {...getReferenceProps()}>Open Drawer</Button>
 <Drawer
  open={open}
  onOpenChange={setOpen}
  {...getFloatingProps()}
 >
  <div>
   <p>Drawer content</p>
   <Button onClick={hide}>Close Drawer</Button>
  </div>
 </Drawer>
</>
```
