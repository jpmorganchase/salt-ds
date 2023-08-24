import { ReactElement } from "react";
import { FormField,Checkbox,  GridLayout, StackLayout, FormFieldLabel, FormFieldHelperText, Input } from "@salt-ds/core";

export const GroupedWithEmptySlot = (): ReactElement => ( 
<StackLayout
    style={{ "--formField-label-width": "100px" } as React.CSSProperties}
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
