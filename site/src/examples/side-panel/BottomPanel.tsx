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
import { CloseIcon } from "@salt-ds/icons";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const BottomPanel = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <StackLayout style={{ width: "100%" }} gap={0}>
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>{open ? "Close" : "Open"} Bottom Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel position="bottom" aria-labelledby={headingId}>
          <StackLayout align="start">
            <Button
              appearance="transparent"
              aria-label="close panel"
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              <CloseIcon aria-hidden />
            </Button>
            <H2 id={headingId}>Section title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            <FlexLayout>
              {Array.from({ length: 4 }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
                <FormFieldExample key={index} />
              ))}
            </FlexLayout>
          </StackLayout>
        </SidePanel>
      </StackLayout>
    </SidePanelGroup>
  );
};
