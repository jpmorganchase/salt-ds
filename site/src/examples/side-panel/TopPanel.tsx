import {
  Button,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { SidePanel } from "@salt-ds/lab";
import { useState } from "react";

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const TopPanel = () => {
  const [open, setOpen] = useState(true);
  const id = useId();

  return (
    <StackLayout gap={0} style={{ width: "100%" }}>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="top"
        aria-labelledby={id}
        style={{
          height: 280,
        }}
      >
        <StackLayout>
          <Button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
            }}
          >
            Close
          </Button>
          <H2 id={id}>Section title</H2>
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
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </SidePanel>
      <FlexItem padding={1}>
        <Button onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"} Top Panel
        </Button>
      </FlexItem>
    </StackLayout>
  );
};
