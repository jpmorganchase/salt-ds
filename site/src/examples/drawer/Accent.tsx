import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const Accent = (): ReactElement => {
  const [openWithAccent, setOpenWithAccent] = useState(false);
  const [openWithoutAccent, setOpenWithoutAccent] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenWithAccent(true)}>
        Open Drawer with accent
      </Button>
      <Drawer
        open={openWithAccent}
        onOpenChange={setOpenWithAccent}
        position="right"
        style={{ width: 400 }}
      >
        <DrawerHeader
          header="Drawer with accent"
          actions={
            <DrawerCloseButton onClick={() => setOpenWithAccent(false)} />
          }
        />
        <DrawerContent>
          <Text>The accent bar is rendered by default.</Text>
        </DrawerContent>
      </Drawer>
      <Button onClick={() => setOpenWithoutAccent(true)}>
        Open Drawer without accent
      </Button>
      <Drawer
        open={openWithoutAccent}
        onOpenChange={setOpenWithoutAccent}
        position="right"
        style={{ width: 400 }}
      >
        <DrawerHeader
          disableAccent
          header="Drawer without accent"
          actions={
            <DrawerCloseButton onClick={() => setOpenWithoutAccent(false)} />
          }
        />
        <DrawerContent>
          <Text>Use disableAccent to hide the accent bar.</Text>
        </DrawerContent>
      </Drawer>
    </StackLayout>
  );
};
