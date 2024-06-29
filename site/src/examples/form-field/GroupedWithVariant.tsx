import {
  Checkbox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  type InputProps,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const GroupedWithVariant = (): ReactElement => {
  const groupedControlProps = { variant: "secondary" } as Partial<InputProps>;

  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>Form Field label left</FormFieldLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormFieldLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
      </FormField>
      <FormField>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Checkbox defaultValue="Value" />
      </FormField>
      <FormField>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
      </FormField>
    </StackLayout>
  );
};
