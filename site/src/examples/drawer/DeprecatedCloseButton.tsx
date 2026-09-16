import {
  Button,
  Drawer,
  DrawerCloseButton,
  H2,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const DeprecatedCloseButton = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Open drawer with close button
      </Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="right"
        style={{ width: 400 }}
        aria-labelledby={id}
      >
        <DrawerCloseButton onClick={handleClose} />
        <StackLayout>
          <H2 id={id}>Section title</H2>
          <Text>
            The close button renders in the top right corner of the drawer.
          </Text>
        </StackLayout>
      </Drawer>
    </>
  );
};
