import { ReactElement } from "react";
import {
  FormField,
  FormFieldLabelPlacement,
  StackLayout,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";

export const GroupedWithLabelRight = (): ReactElement => {
  const groupedProps: { labelPlacement: FormFieldLabelPlacement } = {
    labelPlacement: "right",
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
