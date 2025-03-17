import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { RangeSlider, type RangeSliderProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { toFloat } from "packages/lab/src/slider/internal/utils";
import { type ChangeEvent, useState } from "react";

export default {
  title: "Lab/RangeSlider",
  component: RangeSlider,
};

const Template: StoryFn = ({ ...args }) => {
  return <RangeSlider style={{ width: "500px" }} {...args} />;
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
  defaultValue: [0, 4],
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

export const WithMarkTicks = Template.bind({});
WithMarkTicks.args = {
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
  "aria-label": "With Mark Ticks",
  showTicks: true,
};

WithMarkTicks.parameters = {
  actions: { disable: true },
};

export const WithRestrictToMarks = Template.bind({});
WithRestrictToMarks.args = {
  marks: [
    {
      label: "1",
      value: 1,
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
      label: "10",
      value: 10,
    },
  ],
  "aria-label": "With Restrict to Marks",
  showTicks: true,
  restrictToMarks: true,
  defaultValue: [0, 8],
};

WithRestrictToMarks.parameters = {
  actions: { disable: true },
};

export const WithInlineLabelsAndMarks = Template.bind({});
WithInlineLabelsAndMarks.args = {
  "aria-label": "WithInlineLabelsAndMarks",
  min: 0,
  max: 50,
  step: 10,
  defaultValue: [10, 30],
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

export const WithInlineLabelsMarksAndTicks = Template.bind({});
WithInlineLabelsMarksAndTicks.args = {
  "aria-label": "WithInlineLabelsMarksAndTicks",
  min: 0,
  max: 50,
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
  showTicks: true,
};

WithInlineLabelsMarksAndTicks.parameters = {
  actions: { disable: true },
};

export const WithConstrainedLabelPosition = Template.bind({});
WithConstrainedLabelPosition.args = {
  "aria-label": "WithConstrainedLabelPosition",
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

export const WithDisabledTooltip = Template.bind({});
WithDisabledTooltip.args = {
  "aria-label": "WithDisabledTooltip",
  min: 0,
  max: 50,
  defaultValue: [20, 40],
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
  defaultValue: [20, 45],
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

export const WithInput: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    variant: "min" | "max",
  ) => {
    const inputValue = event.target.value;
    const sliderValues = [...value];

    variant === "min"
      ? setMinInputValue(inputValue)
      : setMaxInputValue(inputValue);

    if (variant === "min") {
      setMinInputValue(inputValue);
      sliderValues[0] = toFloat(inputValue);
    } else {
      setMaxInputValue(inputValue);
      sliderValues[1] = toFloat(inputValue);
    }

    setValue(sliderValues as [number, number]);
  };

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout style={{ width: "100%" }} gap={2}>
        <Input
          value={minInputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "min")
          }
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
        />
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          step={3}
          value={value}
          onChange={(_e, value: [number, number]) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          aria-label="withInput"
          style={{ flex: "100%" }}
        />
        <Input
          value={maxInputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "max")
          }
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInputAndInlineLabels: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    variant: "min" | "max",
  ) => {
    const inputValue = event.target.value;
    const sliderValues = [...value];

    variant === "min"
      ? setMinInputValue(inputValue)
      : setMaxInputValue(inputValue);

    if (variant === "min") {
      setMinInputValue(inputValue);
      sliderValues[0] = toFloat(inputValue);
    } else {
      setMaxInputValue(inputValue);
      sliderValues[1] = toFloat(inputValue);
    }

    setValue(sliderValues as [number, number]);
  };

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout style={{ width: "100%" }} gap={2}>
        <Input
          value={minInputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "min")
          }
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
        />
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          step={3}
          value={value}
          onChange={(_e, value: [number, number]) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          aria-label="WithInputAndInlineLabels"
          style={{ flex: "100%" }}
          minLabel="-50"
          maxLabel="50"
        />
        <Input
          value={maxInputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "max")
          }
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInputAndMarks: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    variant: "min" | "max",
  ) => {
    const inputValue = event.target.value;
    const sliderValues = [...value];

    variant === "min"
      ? setMinInputValue(inputValue)
      : setMaxInputValue(inputValue);

    if (variant === "min") {
      setMinInputValue(inputValue);
      sliderValues[0] = toFloat(inputValue);
    } else {
      setMaxInputValue(inputValue);
      sliderValues[1] = toFloat(inputValue);
    }

    setValue(sliderValues as [number, number]);
  };

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout gap={3}>
        <Input
          value={minInputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "min")
          }
        />
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          step={3}
          value={value}
          onChange={(_e, value: [number, number]) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          aria-label="WithInputAndMarks"
          style={{ flex: "100%" }}
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
        <Input
          value={maxInputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "max")
          }
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithinFormField: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([20, 40]);

  return (
    <FormField style={{ width: "500px" }}>
      <FormFieldLabel>Range Slider within Form Field</FormFieldLabel>
      <RangeSlider
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
      <RangeSlider
        min={-1}
        max={1}
        minLabel="-1"
        maxLabel="1"
        defaultValue={[-1, 0]}
        aria-label="firstSlider"
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        minLabel="-1"
        maxLabel="1"
        step={0.2}
        defaultValue={[-1, 0.2]}
        aria-label="secondSlider"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        minLabel="-1"
        maxLabel="1"
        step={0.25}
        defaultValue={[-1, 0.25]}
        aria-label="thirdSlider"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);

export const WithNonNumericValues = () => {
  const [value, setValue] = useState<[number, number]>([1, 3]);

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
    <RangeSlider
      aria-label="Days of the week"
      style={{ width: "500px" }}
      min={1}
      max={7}
      value={value}
      onChange={(_e, value) => setValue(value)}
      format={getDayOfTheWeek}
      marks={daysOfTheWeek.map((day) => {
        return { value: day.value, label: day.label };
      })}
    />
  );
};

export const Disabled = Template.bind({});
Disabled.args = {
  "aria-label": "Disabled",
  min: 0,
  max: 50,
  defaultValue: [20, 35],
  disabled: true,
  minLabel: "0",
  maxLabel: "50",
};
