import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { AddIcon, RefreshIcon, RemoveIcon } from "@salt-ds/icons";
import { StepperInput } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
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

export const Controlled: StoryFn = (args) => {
  const [value, setValue] = useState<number | string>(1.11);

  return (
    <FormField>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput
        {...args}
        decimalPlaces={2}
        value={value}
        onChange={(_event, value) => {
          setValue(value);
        }}
        endAdornment={
          <Button
            variant="secondary"
            aria-label="refresh"
            onClick={() => setValue(1.11)}
          >
            <RefreshIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>
        The stepper input value is: {value}
      </FormFieldHelperText>
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
      const numericValue = Number.parseFloat(value);
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
        onChange={(_event, value) => {
          setValue(value);
        }}
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
        onChange={(_event, value) => {
          setValue(value);
        }}
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
        onChange={(_event, value) => {
          setValue(value);
        }}
        value={value}
        startAdornment={
          <Button
            aria-label="decrement value"
            onClick={() =>
              setValue(
                typeof value === "string"
                  ? Number.parseFloat(value) - 1
                  : value - 1,
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
                typeof value === "string"
                  ? Number.parseFloat(value) + 1
                  : value + 1,
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
