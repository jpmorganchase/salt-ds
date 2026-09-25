import {
  Button,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

const placeholderText =
  "This placeholder text is provided to illustrate how content will appear within the component. The sentences are intended for demonstration only and do not convey specific information. Generic examples like this help review layout, spacing, and overall design. Adjust the wording as needed to fit your use case or display requirements. ";

export const Resizable = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Resizable Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="right"
        resizable
        defaultSize={400}
        minSize={320}
        maxSize={720}
      >
        <DrawerHeader
          header="Section title"
          description="Drag the handle on the inner edge, or focus it and use the arrow keys."
          actions={
            <Button
              aria-label="Close drawer"
              appearance="transparent"
              onClick={handleClose}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DrawerContent>
          <StackLayout>
            <Text>{placeholderText}</Text>
          </StackLayout>
        </DrawerContent>
        <DrawerFooter>
          <Button sentiment="accented" onClick={handleClose}>
            Save
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
};
