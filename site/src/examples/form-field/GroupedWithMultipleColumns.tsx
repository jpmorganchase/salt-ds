import {
  Checkbox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

export const GroupedWithMultipleColumns = (): ReactElement => {
  return (
    <StackLayout
      style={{ "--saltFormField-label-width": "100px" } as CSSProperties}
    >
      <FormField>
        <FormFieldLabel>Form Field label left</FormFieldLabel>
        <Input defaultValue="Value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <StackLayout direction={{ xs: "column", sm: "row" }}>
        <FormField>
          <FormFieldLabel>Form Field label</FormFieldLabel>
          <Input defaultValue="Value" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Form Field label</FormFieldLabel>
          <Input defaultValue="Value" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Form Field label</FormFieldLabel>
          <Checkbox defaultValue="Value" />
        </FormField>
      </StackLayout>
      <FormField>
        <FormFieldLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormFieldLabel>
        <Input defaultValue="Value" />
      </FormField>
      <StackLayout direction={{ xs: "column", sm: "row" }}>
        <FormField>
          <FormFieldLabel>Form Field label</FormFieldLabel>
          <Input defaultValue="Value" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Form Field label</FormFieldLabel>
          <Input defaultValue="Value" />
        </FormField>
      </StackLayout>
      <FormField>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Value" />
      </FormField>
    </StackLayout>
  );
};
