import { ReactElement } from "react";
import { FormField,Tooltip, FlowLayout, FormFieldLabel, FormFieldHelperText, Input } from "@salt-ds/core";

export const Validation = (): ReactElement => (
    <FlowLayout style={{ width: "256px" }}>
      <FormField validationStatus="error">
        <FormFieldLabel>Error Form Field</FormFieldLabel>
        <Input defaultValue="Input value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField validationStatus="warning">
        <FormFieldLabel>Warning Form Field</FormFieldLabel>
        <Input defaultValue="Input value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField validationStatus="success">
        <FormFieldLabel>Success Form Field</FormFieldLabel>
        <Input defaultValue="Input value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>

      <FormField validationStatus="error">
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Tooltip content="Helper text indicating error">
          <Input defaultValue="Value" />
        </Tooltip>
      </FormField>
      <FormField validationStatus="warning">
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Tooltip content="Helper text indicating warning">
          <Input defaultValue="Value" />
        </Tooltip>
      </FormField>
      <FormField validationStatus="success">
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Tooltip content="Helper text indicating success">
          <Input defaultValue="Value" />
        </Tooltip>
      </FormField>
    </FlowLayout>
);
