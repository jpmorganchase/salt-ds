import { ReactElement } from "react";
import { FormField, FlowLayout, FormFieldLabel, Input } from "@salt-ds/core";

export const NecessityLabel = (): ReactElement => (
  <FlowLayout style={{ width: "366px" }}>
    <FormField necessity="optional">
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <Input defaultValue="Input value" />
    </FormField>
    <FormField necessity="required">
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <Input defaultValue="Input value" />
    </FormField>
    <FormField necessity="asterisk">
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <Input defaultValue="Input value" />
    </FormField>
  </FlowLayout>
);
