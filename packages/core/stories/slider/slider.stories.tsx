import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  Slider,
  type SliderProps,
  StackLayout,
  useResponsiveProp,
} from "@salt-ds/core";
import type { StoryFn } from "@storybook/react";
import { type ChangeEvent, useEffect, useState } from "react";

const marks = [
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
];

export default {
  title: "Core/Slider",
  component: Slider,
};

const Template: StoryFn = ({ ...args }) => {
  return <Slider style={{ maxWidth: "400px", width: "90vw" }} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  "aria-label": "Default",
};

Default.parameters = {
  actions: { disable: true },
};

export const WithInlineLabels = Template.bind({});
WithInlineLabels.args = {
  "aria-label": "With inline labels",
  minLabel: "Lowest value",
  maxLabel: "Highest value",
  accessibleMinText: "Lowest value",
  accessibleMaxText: "Highest value",
};

WithInlineLabels.parameters = {
  actions: { disable: true },
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: 0,
  max: 10,
  marks: marks,
  "aria-label": "With marks",
};

WithMarks.parameters = {
  actions: { disable: true },
};

export const WithMarkTicks = Template.bind({});
WithMarkTicks.args = {
  min: 0,
  max: 10,
  marks: marks,
  "aria-label": "With mark ticks",
  showTicks: true,
};

WithMarkTicks.parameters = {
  actions: { disable: true },
};

export const WithRestrictToMarks = Template.bind({});
WithRestrictToMarks.args = {
  marks: [
    { value: 0, label: "0" },
    { value: 15, label: "15" },
    { value: 25, label: "25" },
    { value: 35, label: "35" },
    { value: 70, label: "70" },
    { value: 80, label: "80" },
    { value: 100, label: "100" },
  ],
  "aria-label": "With restrict to marks",
  showTicks: true,
  restrictToMarks: true,
};

WithRestrictToMarks.parameters = {
  actions: { disable: true },
};

export const WithInlineLabelsAndMarks = Template.bind({});
WithInlineLabelsAndMarks.args = {
  "aria-label": "With inline labels and marks",
  min: 0,
  max: 50,
  defaultValue: 30,
  step: 10,
  minLabel: "Very low",
  maxLabel: "Very high",
  accessibleMinText: "Very low",
  accessibleMaxText: "Very high",
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

export const WithInlineLabelsMarksAndTicks = Template.bind({});
WithInlineLabelsMarksAndTicks.args = {
  "aria-label": "With inline labels, marks and ticks",
  min: 0,
  max: 50,
  defaultValue: 30,
  step: 10,
  minLabel: "Very low",
  maxLabel: "Very high",
  accessibleMinText: "Very low",
  accessibleMaxText: "Very high",
  marks: [
    { label: "0", value: 0 },
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
    { label: "50", value: 50 },
  ],
  showTicks: true,
};

WithInlineLabelsMarksAndTicks.parameters = {
  actions: { disable: true },
};

export const WithConstrainedLabelPosition = Template.bind({});
WithConstrainedLabelPosition.args = {
  "aria-label": "With constrained label position",
  min: 0,
  max: 10,
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
  constrainLabelPosition: true,
};

WithConstrainedLabelPosition.parameters = {
  actions: { disable: true },
};

export const WithConstrainedLabelPositionAndTicks = Template.bind({});
WithConstrainedLabelPositionAndTicks.args = {
  "aria-label": "With constrained label position and ticks",
  min: 0,
  max: 10,
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
  constrainLabelPosition: true,
  showTicks: true,
};

WithConstrainedLabelPositionAndTicks.parameters = {
  actions: { disable: true },
};

export const WithHiddenTooltip = Template.bind({});
WithHiddenTooltip.args = {
  "aria-label": "With hidden tooltip",
  min: 0,
  max: 50,
  defaultValue: 20,
  minLabel: "Very low",
  maxLabel: "Very high",
  accessibleMinText: "Very low",
  accessibleMaxText: "Very high",
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

WithHiddenTooltip.parameters = {
  actions: { disable: true },
};

export const WithNegativeBounds = Template.bind({});
WithNegativeBounds.args = {
  "aria-label": "With negative bounds",
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
  "aria-label": "With formatting",
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
    { value: 0, label: "€0" },
    { value: 50, label: "€50" },
  ],
};

WithFormatting.parameters = {
  actions: { disable: true },
};

export const WithinFormField: StoryFn<SliderProps> = () => {
  return (
    <StackLayout gap={4} style={{ maxWidth: "400px", width: "90vw" }}>
      <FormField
        labelPlacement="left"
        style={
          {
            "--saltFormField-label-width": "25%",
          } as React.CSSProperties
        }
      >
        <FormFieldLabel>Form field left</FormFieldLabel>
        <Slider minLabel="0" maxLabel="10" min={0} max={10} />
      </FormField>
      <FormField
        labelPlacement="left"
        style={
          {
            "--saltFormField-label-width": "28%",
          } as React.CSSProperties
        }
      >
        <FormFieldLabel>Form field left</FormFieldLabel>
        <Slider showTicks marks={marks} min={0} max={10} />
      </FormField>
      <FormField>
        <FormFieldLabel>Form field top</FormFieldLabel>
        <Slider minLabel="0" maxLabel="10" min={0} max={10} />
      </FormField>
      <FormField>
        <FormFieldLabel>Form field top</FormFieldLabel>
        <Slider showTicks marks={marks} min={0} max={10} />
      </FormField>
    </StackLayout>
  );
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
    <FormField style={{ maxWidth: "400px", width: "90vw" }}>
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
    <FormField style={{ maxWidth: "400px", width: "90vw" }}>
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

export const WithInputAndMarksAndTicks: StoryFn<SliderProps> = () => {
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
    <FormField style={{ maxWidth: "400px", width: "90vw" }}>
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
          showTicks
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithCustomStep = () => (
  <StackLayout gap={10} style={{ maxWidth: "400px", width: "90vw" }}>
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
    { label: "Monday", shortLabel: "Mon", value: 1 },
    { label: "Tuesday", shortLabel: "Tue", value: 2 },
    { label: "Wednesday", shortLabel: "Wed", value: 3 },
    { label: "Thursday", shortLabel: "Thu", value: 4 },
    { label: "Friday", shortLabel: "Fri", value: 5 },
    { label: "Saturday", shortLabel: "Sat", value: 6 },
    { label: "Sunday", shortLabel: "Sun", value: 7 },
  ];

  const getDayOfTheWeek = (value?: number) => {
    const day = daysOfTheWeek.find((day) => day.value === value);
    return day ? day.label : "";
  };

  const responsiveLabels = useResponsiveProp(
    {
      xs: daysOfTheWeek.map((day) => ({
        value: day.value,
        label: day.shortLabel,
      })),
      md: daysOfTheWeek.map((day) => ({ value: day.value, label: day.label })),
    },
    daysOfTheWeek.map((day) => ({ value: day.value, label: day.label })),
  );

  return (
    <Slider
      aria-label="Days of the week"
      min={1}
      max={7}
      value={value}
      onChange={(_e, value) => setValue(value)}
      format={getDayOfTheWeek}
      marks={responsiveLabels}
      style={{ maxWidth: "400px", width: "90vw" }}
    />
  );
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
