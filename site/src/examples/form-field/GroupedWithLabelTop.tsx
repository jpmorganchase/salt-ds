import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  type FormFieldLabelPlacement,
  Input,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const GroupedWithLabelTop = (): ReactElement => {
  const groupedProps: { labelPlacement: FormFieldLabelPlacement } = {
    labelPlacement: "top",
  };

  return (
    <StackLayout role={"group"}>
      <FormField {...groupedProps}>
        <FormFieldLabel>Form Field label left</FormFieldLabel>
        <Input defaultValue="Value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField {...groupedProps}>
        <FormFieldLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormFieldLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
      <FormField {...groupedProps}>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField {...groupedProps}>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
    </StackLayout>
  );
};
