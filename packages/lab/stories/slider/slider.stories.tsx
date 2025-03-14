import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { Slider, type SliderProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { type ChangeEvent, useEffect, useState } from "react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Template: StoryFn = ({ ...args }) => {
  return <Slider style={{ width: "500px" }} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  "aria-label": "default",
};

Default.parameters = {
  actions: { disable: true },
};

export const WithInlineLabels = Template.bind({});
WithInlineLabels.args = {
  "aria-label": "WithInlineLabels",
  minLabel: "Lowest value",
  maxLabel: "Highest value",
  defaultValue: 4,
};

WithInlineLabels.parameters = {
  actions: { disable: true },
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: 0,
  max: 10,
  marks: [
    {
      label: "0",
      value: 0,
    },
    {
      label: "1",
      value: 1,
    },
    {
      label: "2",
      value: 2,
    },
    {
      label: "3",
      value: 3,
    },
    {
      label: "4",
      value: 4,
    },
    {
      label: "5",
      value: 5,
    },
    {
      label: "6",
      value: 6,
    },
    {
      label: "7",
      value: 7,
    },
    {
      label: "8",
      value: 8,
    },
    {
      label: "9",
      value: 9,
    },
    {
      label: "10",
      value: 10,
    },
  ],
  "aria-label": "With Marks",
};

WithMarks.parameters = {
  actions: { disable: true },
};

export const WithInlineLabelsAndMarks = Template.bind({});
WithInlineLabelsAndMarks.args = {
  "aria-label": "WithInlineLabelsAndMarks",
  min: 0,
  max: 50,
  defaultValue: 30,
  step: 10,
  minLabel: "Very low",
  maxLabel: "Very high",
  marks: [
    { label: "0", value: 0 },
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
    { label: "50", value: 50 },
  ],
};

WithInlineLabelsAndMarks.parameters = {
  actions: { disable: true },
};

export const WithDisabledTooltip = Template.bind({});
WithDisabledTooltip.args = {
  "aria-label": "WithDisabledTooltip",
  min: 0,
  max: 50,
  defaultValue: 20,
  minLabel: "Very low",
  maxLabel: "Very high",
  showTooltip: false,
  step: 10,
  marks: [
    { label: "0", value: 0 },
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
    { label: "50", value: 50 },
  ],
};

WithDisabledTooltip.parameters = {
  actions: { disable: true },
};

export const WithNegativeBounds = Template.bind({});
WithNegativeBounds.args = {
  "aria-label": "WithNegativeBounds",
  min: -5,
  max: 5,
  minLabel: "-5",
  maxLabel: "5",
};

WithNegativeBounds.parameters = {
  actions: { disable: true },
};

export const WithFormatting = Template.bind({});
WithFormatting.args = {
  "aria-label": "WithFormatting",

  min: 0,
  max: 50,
  defaultValue: 25,
  format: (value: number) =>
    Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value),
  marks: [
    { value: 0, label: "0€" },
    { value: 50, label: "50€" },
  ],
};

WithFormatting.parameters = {
  actions: { disable: true },
};

export const WithInput: StoryFn<SliderProps> = () => {
  const [value, setValue] = useState<number>(5);
  const [inputValue, setInputValue] = useState<string | number>(value);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    if (Number.isNaN(Number(inputValue))) return;
    setValue(Number.parseFloat(inputValue));
  };

  const validateSingle = (value: string | number, bounds: [number, number]) => {
    if (Number.isNaN(Number(value))) return false;
    if (Number(value) < bounds[0] || Number(value) > bounds[1]) return false;
    return true;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only need to run when inputValue and bounds change
  useEffect(() => {
    const valid = validateSingle(inputValue, bounds);
    setValidationStatus(valid ? undefined : "error");
  }, [inputValue, bounds]);

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={3}>
        <Input
          value={inputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={handleInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ flex: "100%" }}
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={(_e, value) => {
            setInputValue(value);
            setValue(value);
          }}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInputAndInlineLabels: StoryFn<SliderProps> = () => {
  const [value, setValue] = useState<number>(-20);
  const [inputValue, setInputValue] = useState<string | number>(value);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    if (Number.isNaN(Number(inputValue))) return;
    setValue(Number.parseFloat(inputValue));
  };

  const validateSingle = (value: string | number, bounds: [number, number]) => {
    if (Number.isNaN(Number(value))) return false;
    if (Number(value) < bounds[0] || Number(value) > bounds[1]) return false;
    return true;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only need to run when inputValue and bounds change
  useEffect(() => {
    const valid = validateSingle(inputValue, bounds);
    setValidationStatus(valid ? undefined : "error");
  }, [inputValue, bounds]);

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={3}>
        <Input
          value={inputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={handleInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ flex: "100%" }}
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          step={3}
          onChange={(_e, value) => {
            setInputValue(value);
            setValue(value);
          }}
          minLabel="-50"
          maxLabel="50"
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInputAndMarks: StoryFn<SliderProps> = () => {
  const [value, setValue] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string | number>(value);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    if (Number.isNaN(Number(inputValue))) return;
    setValue(Number.parseFloat(inputValue));
  };

  const validateSingle = (value: string | number, bounds: [number, number]) => {
    if (Number.isNaN(Number(value))) return false;
    if (Number(value) < bounds[0] || Number(value) > bounds[1]) return false;
    return true;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only need to run when inputValue and bounds change
  useEffect(() => {
    const valid = validateSingle(inputValue, bounds);
    setValidationStatus(valid ? undefined : "error");
  }, [inputValue, bounds]);

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={3}>
        <Input
          value={inputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={handleInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ flex: "100%" }}
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={(_e, value) => {
            setInputValue(value);
            setValue(value);
          }}
          marks={[
            {
              value: -50,
              label: "-50",
            },
            {
              value: 0,
              label: "0",
            },
            {
              value: 50,
              label: "50",
            },
          ]}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithinFormField: StoryFn<SliderProps> = () => {
  const [value, setValue] = useState<number>(5);

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel>Slider within Form Field</FormFieldLabel>
      <Slider
        style={{ flex: "100%" }}
        min={-50}
        max={50}
        value={value}
        onChange={(_e, value) => {
          setValue(value);
        }}
        minLabel="-50"
        maxLabel="50"
      />
    </FormField>
  );
};

export const WithCustomStep = () => (
  <StackLayout gap={10} style={{ width: "500px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <Slider min={-1} max={1} minLabel="-1" maxLabel="1" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <Slider
        min={-1}
        max={1}
        minLabel="-1"
        maxLabel="1"
        step={0.2}
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <Slider
        min={-1}
        max={1}
        minLabel="-1"
        maxLabel="1"
        step={0.25}
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);

export const WithNonNumericValues = () => {
  const [value, setValue] = useState<number>(3);

  const daysOfTheWeek = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];

  const getDayOfTheWeek = (value?: number) => {
    const day = daysOfTheWeek.find((day) => day.value === value);
    return day ? day.label : "";
  };

  return (
    <Slider
      aria-label="Days of the week"
      min={1}
      max={7}
      value={value}
      onChange={(_e, value) => setValue(value)}
      format={getDayOfTheWeek}
      marks={daysOfTheWeek.map((day) => {
        return { value: day.value, label: day.label };
      })}
      style={{ width: "500px" }}
    />
  );
};

export const WithRestrictedLabelOverflow = Template.bind({});

WithRestrictedLabelOverflow.args = {
  "aria-label": "WithRestrictedLabelOverflow",
  marks: [
    {
      value: 0,
      label: "Very low",
    },
    {
      value: 10,
      label: "Very high",
    },
  ],
  restrictLabelOverflow: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  "aria-label": "Disabled",
  min: 0,
  max: 50,
  defaultValue: 35,
  disabled: true,
  minLabel: "0",
  maxLabel: "50",
};
