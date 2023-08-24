import { ReactElement } from "react";
import { FormField, FlowLayout, FormFieldLabel, FormFieldHelperText, Input } from "@salt-ds/core";

export const LabelLeft = (): ReactElement => (
    <FlowLayout style={{ width: "366px" }}>
    <FormField labelPlacement="left">
      <FormFieldLabel>Form Field label left</FormFieldLabel>
      <Input defaultValue="Value" />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>
        Form Field label that's extra long. Showing that labels wrap around to
        the line.
      </FormFieldLabel>
      <Input defaultValue="Primary Input value" />
    </FormField>
  </FlowLayout>
);
