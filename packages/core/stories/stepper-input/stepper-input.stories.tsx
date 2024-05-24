import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  StepperInput,
} from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { AddIcon, RefreshIcon, RemoveIcon } from "@salt-ds/icons";
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
  const [value, setValue] = useState<number | string>(2);
  const max = 5;
  const min = 0;

  const getValidationStatus = () => {
    if (typeof value === "number") {
      if (value > max || value < min) {
        return "error";
      }
    } else {
      const numericValue = parseFloat(value);
      if (numericValue > max || numericValue < min) {
        return "error";
      }
    }
    return undefined;
  };

  return (
    <FormField validationStatus={getValidationStatus()}>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput
        {...args}
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        max={max}
        min={min}
        style={{ width: "250px" }}
      />
      <FormFieldHelperText>
        Please enter a value between {min} and {max}
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

export const HideButtons: StoryFn = (args) => {
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

export const ReadOnly: StoryFn = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput {...args} readOnly />
    </FormField>
  );
};
