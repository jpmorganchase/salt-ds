import {
  Checkbox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridLayout,
  Input,
  StackLayout,
} from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

export const GroupedWithEmptySlot = (): ReactElement => (
  <StackLayout
    style={{ "--saltFormField-label-width": "100px" } as CSSProperties}
    role={"group"}
  >
    <FormField>
      <FormFieldLabel>Form Field label left</FormFieldLabel>
      <Input defaultValue="Value" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <GridLayout columns={3}>
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
    </GridLayout>
    <FormField>
      <FormFieldLabel>
        Form Field label that's extra long. Showing that labels wrap around to
        the line.
      </FormFieldLabel>
      <Input defaultValue="Value" />
    </FormField>
    <GridLayout columns={2}>
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
    </GridLayout>
    <GridLayout columns={2}>
      <FormField>
        <FormFieldLabel>Form Field label</FormFieldLabel>
        <Input defaultValue="Value" />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
    </GridLayout>
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
