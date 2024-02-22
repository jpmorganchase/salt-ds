import { ReactElement, useState } from "react";

import { Drawer, DrawerCloseButton } from "@salt-ds/lab";
import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  H2,
  Text,
} from "@salt-ds/core";

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const RightDrawer = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>Open Right Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
      >
        <StackLayout>
          <DrawerCloseButton onClick={handleClose} />
          <H2>Section Title</H2>
          <Text>
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
        </StackLayout>
      </Drawer>
    </>
  );
};
