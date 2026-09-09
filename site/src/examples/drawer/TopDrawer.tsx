import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

const placeholderText =
  "This placeholder text is provided to illustrate how content will appear within the component. The sentences are intended for demonstration only and do not convey specific information. Generic examples like this help review layout, spacing, and overall design. Adjust the wording as needed to fit your use case or display requirements. ";

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const TopDrawer = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Top Drawer</Button>
      <Drawer open={open} onOpenChange={setOpen} position="top">
        <DrawerHeader
          header="Section title"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <DrawerContent>
          <StackLayout>
            <Text>{placeholderText}</Text>
            <FlexLayout>
              {Array.from({ length: 4 }, (_, index) => (
                <FormFieldExample key={index} />
              ))}
            </FlexLayout>
          </StackLayout>
        </DrawerContent>
        <DrawerFooter>
          <Button appearance="transparent" onClick={handleClose}>
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
