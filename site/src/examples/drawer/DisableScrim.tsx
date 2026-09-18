import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const DisableScrim = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpen(true)}>Open Primary Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        style={{ width: 300 }}
        disableScrim
      >
        <DrawerHeader
          header="Drawer without scrim"
          actions={
            <Button
              aria-label="Close drawer"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DrawerContent>
          <Text>The content behind this drawer isn't obscured.</Text>
        </DrawerContent>
      </Drawer>
    </StackLayout>
  );
};
