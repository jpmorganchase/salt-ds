import { CSSProperties, ReactElement } from "react";
import {
  FormField,
  Checkbox,
  StackLayout,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";

export const GroupedWithMultipleColumns = (): ReactElement => {
  return (
    <StackLayout
      style={{ "--formField-label-width": "100px" } as CSSProperties}
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
