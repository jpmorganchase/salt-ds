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

export const DisableAccent = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpen(true)}>Open Drawer without accent</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="right"
        style={{ width: 400 }}
      >
        <DrawerHeader
          disableAccent
          header="Drawer without accent"
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
          <Text>Use disableAccent to hide the accent bar.</Text>
        </DrawerContent>
      </Drawer>
    </StackLayout>
  );
};
