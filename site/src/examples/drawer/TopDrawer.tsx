import {
  Button,
  Drawer,
  DrawerCloseButton,
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

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const TopDrawer = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>Open Top Drawer</Button>
      <Drawer open={open} onOpenChange={onOpenChange} position="top">
        <DrawerHeader
          header="Section title"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <StackLayout>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </Drawer>
    </>
  );
};
