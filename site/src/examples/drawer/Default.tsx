import { ReactElement, useState } from "react";

import { Drawer, DrawerCloseButton } from "@salt-ds/lab";
import { Button, StackLayout } from "@salt-ds/core";

export const Default = (): ReactElement => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
        id="primary-drawer"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenPrimary(false)} />
      </Drawer>
      <Button onClick={() => setOpenSecondary(true)}>
        Open Secondary Drawer
      </Button>
      <Drawer
        open={openSecondary}
        onOpenChange={(newOpen) => setOpenSecondary(newOpen)}
        variant="secondary"
        id="secondary-drawer"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenSecondary(false)} />
      </Drawer>
    </StackLayout>
  );
};
