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
import { type CSSProperties, type ReactElement, useState } from "react";

const placeholderText =
  "This placeholder text is provided to illustrate how content will appear within the component. The sentences are intended for demonstration only and do not convey specific information. Generic examples like this help review layout, spacing, and overall design. Adjust the wording as needed to fit your use case or display requirements. ";

export const Resizable = (): ReactElement => {
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
        resizable
        style={
          {
            width: 320,
            "--saltDrawer-minWidth": "200px",
            "--saltDrawer-maxWidth": "640px",
          } as CSSProperties
        }
      >
        <DrawerHeader
          header="Resizable drawer"
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
            <Text>
              This drawer can be resized between 200px and 640px wide.
            </Text>
            <Text>{placeholderText.repeat(2)}</Text>
          </StackLayout>
        </DrawerContent>
        <DrawerFooter>
          <Button
            sentiment="accented"
            appearance="bordered"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Save
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
};
