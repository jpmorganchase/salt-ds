import { ReactElement } from "react";
import {
  FormField,
  FlowLayout,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";

export const Label = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Form Field label top (default)</FormFieldLabel>
      <Input defaultValue="Value" />
    </FormField>
    <FormField>
      <FormFieldLabel>
        Form Field label that's extra long. Showing that labels wrap around to
        the line.
      </FormFieldLabel>
      <Input defaultValue="Primary Input value" />
    </FormField>
  </FlowLayout>
);
