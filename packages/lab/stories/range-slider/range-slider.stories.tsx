import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
  useId,
  useResponsiveProp,
} from "@salt-ds/core";
import { RangeSlider, type RangeSliderProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { toFloat } from "packages/lab/src/slider/internal/utils";
import { type ChangeEvent, useState } from "react";

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

const accessibleTextStyles: React.CSSProperties = {
  position: "absolute",
  height: "1px",
  width: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
};

export default {
  title: "Lab/RangeSlider",
  component: RangeSlider,
};

const Template: StoryFn = ({ ...args }) => {
  return <RangeSlider style={{ maxWidth: "400px", width: "90vw" }} {...args} />;
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
  "aria-label": "With marks and ticks",
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
  min: 0,
  max: 100,
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
  step: 10,
  defaultValue: [10, 30],
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
  "aria-label": "With inline labels and marks and ticks",
  min: 0,
  max: 50,
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
  defaultValue: [2, 5],
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
  "aria-label": "With disabled tooltip",
  min: 0,
  max: 50,
  defaultValue: [20, 40],
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
  defaultValue: [20, 45],
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

export const WithinFormField: StoryFn<RangeSliderProps> = () => {
  return (
    <StackLayout gap={4} style={{ maxWidth: "400px", width: "90vw" }}>
      <FormField
        labelPlacement="left"
        style={
          {
            "--saltFormField-label-width": "20%",
          } as React.CSSProperties
        }
      >
        <FormFieldLabel>Form field left</FormFieldLabel>
        <RangeSlider minLabel="0" maxLabel="10" min={0} max={10} />
      </FormField>
      <FormField
        labelPlacement="left"
        style={
          {
            "--saltFormField-label-width": "23%",
          } as React.CSSProperties
        }
      >
        <FormFieldLabel>Form field left</FormFieldLabel>
        <RangeSlider showTicks marks={marks} min={0} max={10} />
      </FormField>
      <FormField>
        <FormFieldLabel>Form field top</FormFieldLabel>
        <RangeSlider minLabel="0" maxLabel="10" min={0} max={10} />
      </FormField>
      <FormField>
        <FormFieldLabel>Form field top</FormFieldLabel>
        <RangeSlider showTicks marks={marks} min={0} max={10} />
      </FormField>
    </StackLayout>
  );
};

export const WithInput: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];
  const minimumInputLabel = useId();
  const maximumInputLabel = useId();

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
    <FormField style={{ maxWidth: "400px", width: "90vw" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout style={{ width: "100%" }} gap={2}>
        <span style={accessibleTextStyles} id={minimumInputLabel}>
          Minimum
        </span>
        <Input
          aria-labelledby={minimumInputLabel}
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
          value={value}
          onChange={(_e, value: [number, number]) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          style={{ flex: "100%" }}
        />
        <span style={accessibleTextStyles} id={maximumInputLabel}>
          Maximum
        </span>
        <Input
          aria-labelledby={maximumInputLabel}
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
  const minimumInputLabel = useId();
  const maximumInputLabel = useId();

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
    <FormField style={{ maxWidth: "400px", width: "90vw" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout style={{ width: "100%" }} gap={2}>
        <span style={accessibleTextStyles} id={minimumInputLabel}>
          Minimum
        </span>
        <Input
          aria-labelledby={minimumInputLabel}
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
          value={value}
          onChange={(_e, value: [number, number]) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          style={{ flex: "100%" }}
          minLabel="-50"
          maxLabel="50"
        />
        <span style={accessibleTextStyles} id={maximumInputLabel}>
          Maximum
        </span>
        <Input
          aria-labelledby={maximumInputLabel}
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

export const WithInputAndMarksAndTicks: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];
  const minimumInputLabel = useId();
  const maximumInputLabel = useId();

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
    <FormField style={{ maxWidth: "400px", width: "90vw" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout gap={3}>
        <span style={accessibleTextStyles} id={minimumInputLabel}>
          Minimum
        </span>
        <Input
          aria-labelledby={minimumInputLabel}
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
          value={value}
          onChange={(_e, value: [number, number]) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
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
          showTicks
        />
        <span style={accessibleTextStyles} id={maximumInputLabel}>
          Maximum
        </span>
        <Input
          aria-labelledby={maximumInputLabel}
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

export const WithCustomStep = () => (
  <StackLayout gap={10} style={{ width: "300px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        minLabel="-1"
        maxLabel="1"
        defaultValue={[-1, 0]}
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
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);

export const WithNonNumericValues = () => {
  const [value, setValue] = useState<[number, number]>([1, 3]);

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
    <RangeSlider
      aria-label="Days of the week"
      style={{ width: "80vw", maxWidth: "400px" }}
      min={1}
      max={7}
      value={value}
      onChange={(_e, value) => setValue(value)}
      format={getDayOfTheWeek}
      marks={responsiveLabels}
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
