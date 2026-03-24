import {
  Button,
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
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const LeftPanel = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: 300,
        }}
        gap={0}
      >
        <SidePanel aria-labelledby={headingId}>
          <StackLayout align="start" gap={1}>
            <Button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            <H2 id={headingId}>Section Title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            {Array.from({ length: 7 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </StackLayout>
        </SidePanel>
        <FlexLayout padding={1}>
          <SidePanelTrigger>
            <Button>{open ? "Close" : "Open"} Left Panel</Button>
          </SidePanelTrigger>
        </FlexLayout>
      </FlexLayout>
    </SidePanelGroup>
  );
};
