import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { AddIcon, RefreshIcon, RemoveIcon } from "@salt-ds/icons";
import { SetStateAction, useState } from "react";
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

export const Secondary: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput {...args} variant="secondary" />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};
export const DecimalPlaces: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Default Stepper Input</FormFieldLabel>
      <StepperInput decimalPlaces={2} step={0.01} {...args} />
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

export const RefreshAdornment: StoryFn = (args) => {
  const [value, setValue] = useState<number | string>(10);

  return (
    <FormField>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput
        {...args}
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        endAdornment={
          <Button
            variant="secondary"
            aria-label="refresh"
            onClick={() => setValue(10)}
          >
            <RefreshIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};

export const HideButton: StoryFn = (args) => {
  const [value, setValue] = useState<number | string>(10);

  return (
    <FormField>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput
        {...args}
        hideButtons
        textAlign="center"
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        startAdornment={
          <Button
            aria-label="decerement value"
            onClick={() =>
              setValue(
                typeof value === "string" ? parseFloat(value) - 1 : value - 1
              )
            }
          >
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button
            aria-label="increment value"
            onClick={() =>
              setValue(
                typeof value === "string" ? parseFloat(value) + 1 : value + 1
              )
            }
          >
            <AddIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};
