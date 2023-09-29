import { ReactNode, useEffect, useState } from "react";
import { SaltProvider, Panel } from "@salt-ds/core";
import { StepperInput, FormField } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";

export default {
  title: "Lab/Stepper Input",
  component: StepperInput,
} as Meta<typeof StepperInput>;

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow = ({ name, children }: ExampleRowProps) => (
  <Panel style={{ width: "100vw" }}>
    <h3>{name} - ( Touch, Low, Medium, High )</h3>
    <ColumnLayoutContainer>
      <ColumnLayoutItem>
        Touch
        <SaltProvider density="touch">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        Low
        <SaltProvider density="low">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        Medium
        <SaltProvider density="medium">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        High
        <SaltProvider density="high">{children}</SaltProvider>
      </ColumnLayoutItem>
    </ColumnLayoutContainer>
  </Panel>
);

const Examples = () => (
  <>
    <ExampleRow name="Default">
      <FormField
        helperText="Please enter a number between -5 and 10"
        label="Default Stepper Input"
      >
        <StepperInput
          decimalPlaces={2}
          defaultValue={0.5}
          max={10}
          min={-5}
          showRefreshButton
          step={0.5}
        />
      </FormField>
    </ExampleRow>
  </>
);

export const All: StoryFn = () => (
  <div style={{ marginTop: -200 }}>
    <SaltProvider mode="light">
      <Examples />
    </SaltProvider>
    <SaltProvider mode="dark">
      <Examples />
    </SaltProvider>
  </div>
);

export const Default: StoryFn = () => {
  const max = 10;
  const min = -5;

  const [isOutOfRange, setIsOutOfRange] = useState(false);

  const handleChange = (value: number | string) =>
    value > max || value < min ? setIsOutOfRange(true) : setIsOutOfRange(false);

  return (
    <SaltProvider>
      <FormField
        helperText={`Please enter a number between ${min} and ${max}`}
        label="Default Stepper Input"
        style={{ width: 292 }}
        validationStatus={isOutOfRange ? "error" : undefined}
      >
        <StepperInput
          defaultValue={0}
          max={max}
          min={min}
          onChange={handleChange}
        />
      </FormField>
    </SaltProvider>
  );
};

export const Alignment: StoryFn = () => (
  <SaltProvider>
    <FormField
      helperText="Please enter a number"
      label="Left-aligned value"
      style={{ display: "block", marginBottom: 80, width: 292 }}
    >
      <StepperInput />
    </FormField>
    <FormField
      helperText="Please enter a number"
      label="Centered value"
      style={{ display: "block", marginBottom: 80, width: 292 }}
    >
      <StepperInput textAlign="center" />
    </FormField>
    <FormField
      helperText="Please enter a number"
      label="Right-aligned value"
      style={{ width: 292 }}
    >
      <StepperInput textAlign="right" />
    </FormField>
  </SaltProvider>
);

export const Controlled: StoryFn = () => {
  const max = 100;
  const min = -100;
  const step = 0.01;

  const [value, setValue] = useState(20.01);

  const handleChange = (nextValue: number | string) => {
    setValue(nextValue as number);
  };

  return (
    <SaltProvider>
      <FormField
        helperText="Please enter a number"
        label="Controlled Stepper Input"
        style={{ width: 292 }}
      >
        <StepperInput
          decimalPlaces={2}
          liveValue={46.66}
          max={max}
          min={min}
          onChange={handleChange}
          showRefreshButton
          step={step}
          value={value}
        />
      </FormField>

      {/* TODO uncomment when <Slider/> has been migrated */}
      {/*<div style={{ marginTop: 80, width: 292 }}>*/}
      {/*  <Slider*/}
      {/*    label="Set the stepper input value:"*/}
      {/*    max={max}*/}
      {/*    min={min}*/}
      {/*    onChange={nextValue => setValue(nextValue)}*/}
      {/*    step={step}*/}
      {/*    tooltipPlacement="bottom"*/}
      {/*    value={value}*/}
      {/*  />*/}
      {/*</div>*/}
    </SaltProvider>
  );
};

export const CustomValues: StoryFn = () => (
  <SaltProvider>
    <FormField
      helperText="Please enter a number"
      label="Custom values"
      style={{ width: 292 }}
    >
      <StepperInput defaultValue={1000} step={100} />
    </FormField>
  </SaltProvider>
);

export const Decimals: StoryFn = () => (
  <SaltProvider>
    <FormField
      helperText="Please enter a currency value"
      label="U.S. Dollars ($)"
      style={{ width: 292 }}
    >
      <StepperInput decimalPlaces={2} defaultValue={0.99} step={0.01} />
    </FormField>
  </SaltProvider>
);

export const Error: StoryFn = () => {
  const defaultValue = 15.775;
  const max = 10;
  const min = -10;

  const [liveValue, setLiveValue] = useState(defaultValue);
  const [isOutOfRange, setIsOutOfRange] = useState(false);

  useEffect(() => {
    defaultValue > max || defaultValue < min
      ? setIsOutOfRange(true)
      : setIsOutOfRange(false);
  }, [min, max]);

  const handleChange = (value: number | string) => {
    value > max || value < min ? setIsOutOfRange(true) : setIsOutOfRange(false);
  };

  useEffect(() => {
    // Update `liveValue` to valid number after initial render
    setLiveValue(6.051);
  }, []);

  return (
    <SaltProvider>
      <FormField
        helperText={`Please enter a number between ${min} and ${max}`}
        label="Error validation state"
        style={{ width: 292 }}
        validationStatus={isOutOfRange ? "error" : undefined}
      >
        <StepperInput
          decimalPlaces={3}
          defaultValue={defaultValue}
          liveValue={liveValue}
          max={max}
          min={min}
          onChange={handleChange}
          showRefreshButton
          step={0.001}
        />
      </FormField>
    </SaltProvider>
  );
};

export const LiveDefaultValue: StoryFn = () => {
  const decimalPlaces = 2;
  const defaultValue = 0.0;
  const max = 100.0;
  const min = 0.0;

  const formatValue = (value: number) => value.toFixed(decimalPlaces);

  const [value, setValue] = useState(defaultValue);
  const [isOutOfRange, setIsOutOfRange] = useState(false);

  const randomLiveValue = (minValue: number, maxValue: number) =>
    Math.random() * (maxValue - minValue) + minValue;

  const handleChange = (nextValue: number | string) =>
    nextValue > max || nextValue < min
      ? setIsOutOfRange(true)
      : setIsOutOfRange(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(randomLiveValue(min, max));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SaltProvider>
      <FormField
        helperText={`Current live 'value' prop: ${formatValue(value)}`}
        label="Live Default Value"
        style={{ width: 292 }}
        validationStatus={isOutOfRange ? "error" : undefined}
      >
        <StepperInput
          decimalPlaces={decimalPlaces}
          defaultValue={defaultValue}
          liveValue={value}
          max={max}
          min={min}
          onChange={handleChange}
          step={0.01}
        />
      </FormField>
    </SaltProvider>
  );
};

export const NumericLimits: StoryFn = () => (
  <SaltProvider>
    <FormField
      helperText="Must be below 1000"
      label="Maximum limit"
      style={{ display: "block", marginBottom: 80, width: 292 }}
    >
      <StepperInput defaultValue={999} max={1000} />
    </FormField>

    <FormField
      helperText="Must be above 0"
      label="Minimum limit"
      style={{ display: "block", marginBottom: 80, width: 292 }}
    >
      <StepperInput defaultValue={1} min={0} />
    </FormField>

    <FormField
      helperText="Must be between 0 and 1000"
      label="Maximum and minimum limits"
      style={{ width: 292 }}
    >
      <StepperInput defaultValue={500} max={1000} min={0} />
    </FormField>
  </SaltProvider>
);

export const RefreshButton: StoryFn = () => (
  <SaltProvider>
    <FormField
      helperText="Please enter a number"
      label="Refresh Button"
      style={{ width: 292 }}
    >
      <StepperInput
        block={20}
        decimalPlaces={2}
        defaultValue={15}
        max={30.0}
        min={0.0}
        showRefreshButton
        step={0.5}
        textAlign="center"
      />
    </FormField>
  </SaltProvider>
);
