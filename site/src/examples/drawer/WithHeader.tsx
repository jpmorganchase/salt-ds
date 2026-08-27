import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerHeader,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const WithHeader = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
      >
        <DrawerHeader
          preheader="Settlements - Nostros"
          header="Cash breaks"
          description="LOB: Global Derivatives and Cash"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <StackLayout>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
          </Text>
        </StackLayout>
      </Drawer>
    </>
  );
};
