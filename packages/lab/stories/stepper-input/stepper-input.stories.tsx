import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
export default {
  title: "Lab/Stepper Input",
  component: StepperInput,
} as Meta<typeof StepperInput>;

export const Default: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};

export const DecimalPlaces: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput decimalPlaces={2} {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};

export const RefreshButton: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput
        showRefreshButton
        liveValue={5}
        defaultValue={6}
        {...args}
      />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};

export const MinAndMaxValue: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput max={10} min={0} defaultValue={5} {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};

export const Alignment: StoryFn = (args) => (
  <StackLayout>
    <FormField>
      <FormFieldLabel>Left aligned</FormFieldLabel>
      <StepperInput textAlign="left" {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Center aligned</FormFieldLabel>
      <StepperInput textAlign="center" {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Right aligned</FormFieldLabel>
      <StepperInput textAlign="right" {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  </StackLayout>
);
