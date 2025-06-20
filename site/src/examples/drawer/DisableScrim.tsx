import { Button, Drawer, DrawerCloseButton, StackLayout } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const DisableScrim = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpen(true)}>Open Primary Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={(newOpen) => setOpen(newOpen)}
        style={{ width: 200 }}
        disableScrim
      >
        <DrawerCloseButton onClick={() => setOpen(false)} />
      </Drawer>
    </StackLayout>
  );
};
