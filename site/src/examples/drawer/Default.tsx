import { Button, Drawer, DrawerCloseButton, StackLayout } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const Default = (): ReactElement => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
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
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenSecondary(false)} />
      </Drawer>
      <Button onClick={() => setOpenTertiary(true)}>
        Open Tertiary Drawer
      </Button>
      <Drawer
        open={openTertiary}
        onOpenChange={(newOpen) => setOpenTertiary(newOpen)}
        variant="tertiary"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenTertiary(false)} />
      </Drawer>
    </StackLayout>
  );
};
