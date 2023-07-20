---
"@salt-ds/lab": patch
"@salt-ds/theme": patch
---

Drawer

- Added `Drawer` component

```
const [open, setOpen] = useState(false);
const show = () => setOpen(true);
const hide = () => setOpen(false);
<>
 <Button onClick={show}>Open Drawer</Button>
 <Drawer isOpen={open}>
  <div>
   <p>Drawer content</p>
   <Button onClick={hide}>Close Drawer</Button>
  </div>
 </Drawer>
</>
```

Theme

- Added `both` fill-mode to `--salt-animation-slide-out-*` css animation vars
