import {
  Button,
  capitalize,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

const DrawerTemplate = ({
  variant = "primary",
}: Pick<DrawerProps, "variant">): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>{variant}</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        variant={variant}
        style={{ width: 300 }}
      >
        <DrawerHeader
          header={`${capitalize(variant)} drawer`}
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
          <Text>
            {capitalize(variant)} drawers sit on the container {variant}{" "}
            background.
          </Text>
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

export const Variants = (): ReactElement => (
  <StackLayout gap={1}>
    <DrawerTemplate variant="primary" />
    <DrawerTemplate variant="secondary" />
    <DrawerTemplate variant="tertiary" />
  </StackLayout>
);
