import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { RefreshIcon } from "@salt-ds/icons";
import { useState } from "react";
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

export const MinAndMaxValue: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput max={10} min={0} defaultValue={5} {...args} />
      <FormFieldHelperText>
        Please enter a number between 0 and 10
      </FormFieldHelperText>
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

export const Controlled = () => {
  const [value, setValue] = useState<number | string>(10);

  return (
    <StackLayout direction="row" align="center" gap={1}>
      <FormField>
        <FormFieldLabel>Stepper Input</FormFieldLabel>
        <StepperInput
          value={value}
          onChange={(changedValue) => setValue(changedValue)}
        />
        <FormFieldHelperText>Please enter a value</FormFieldHelperText>
      </FormField>
      <Button onClick={() => setValue(10)}>
        <RefreshIcon />
      </Button>
    </StackLayout>
  );
};
