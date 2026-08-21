import { Button, Drawer, DrawerCloseButton, StackLayout } from "@salt-ds/core";
import { useState } from "react";

export function Dismissible() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        aria-label="Pilot Drawer"
        onOpenChange={setOpen}
        open={open}
        position="right"
        style={{ width: 320 }}
      >
        <DrawerCloseButton onClick={() => setOpen(false)} />
        <StackLayout>
          <Button>First action</Button>
          <Button>Last action</Button>
        </StackLayout>
      </Drawer>
      <form hidden>
        <input data-testid="drawer-open" readOnly value={String(open)} />
      </form>
    </>
  );
}
