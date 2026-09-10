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

const placeholderText =
  "This placeholder text is provided to illustrate how content will appear within the component. The sentences are intended for demonstration only and do not convey specific information. Generic examples like this help review layout, spacing, and overall design. Adjust the wording as needed to fit your use case or display requirements. ";

export const Preheader = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="right"
        style={{ width: 400 }}
      >
        <DrawerHeader
          preheader="Payments"
          header="Check deposit #1278"
          description="Pending transaction review"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <DrawerContent>
          <StackLayout>
            <Text>{placeholderText.repeat(4)}</Text>
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};
