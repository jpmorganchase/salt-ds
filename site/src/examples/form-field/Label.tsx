import { FlowLayout, FormField, FormFieldLabel, Input } from "@salt-ds/core";
import type { ReactElement } from "react";

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
