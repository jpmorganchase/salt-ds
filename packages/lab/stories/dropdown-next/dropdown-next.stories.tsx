import {
  DropdownNext,
  DropdownNextProps,
  Option,
  OptionGroup,
} from "@salt-ds/lab";

import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { GB, US } from "@salt-ds/countries";
import { useState } from "react";

export default {
  title: "Lab/Dropdown Next",
  component: DropdownNext,
} as Meta<typeof DropdownNext>;

const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

const longUsStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const Template: StoryFn<typeof DropdownNext> = (args) => {
  return (
    <DropdownNext {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state}>
          {state}
        </Option>
      ))}
    </DropdownNext>
  );
};

export const Default = Template.bind({});

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: "State",
};

export const WithDefaultSelected = Template.bind({});
WithDefaultSelected.args = {
  defaultSelected: ["California"],
  defaultValue: "California",
};

export const Readonly = Template.bind({});
Readonly.args = {
  readOnly: true,
  defaultSelected: ["California"],
  defaultValue: "California",
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  defaultSelected: ["California"],
  defaultValue: "California",
};

export const DisabledOption: StoryFn<typeof DropdownNext> = (args) => {
  return (
    <DropdownNext {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state} disabled={state === "California"}>
          {state}
        </Option>
      ))}
    </DropdownNext>
  );
};

export const Variants: StoryFn<typeof DropdownNext> = () => {
  return (
    <StackLayout>
      <DropdownNext>
        {usStates.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </DropdownNext>
      <DropdownNext variant="secondary">
        {usStates.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </DropdownNext>
    </StackLayout>
  );
};

export const MultiSelect = Template.bind({});
MultiSelect.args = {
  multiselect: true,
};

export const WithFormField: StoryFn = () => {
  return (
    <FormField>
      <FormFieldLabel>State</FormFieldLabel>
      <DropdownNext>
        {usStates.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </DropdownNext>
      <FormFieldHelperText>Pick a US state</FormFieldHelperText>
    </FormField>
  );
};

export const Grouped: StoryFn<typeof DropdownNext> = (args) => {
  return (
    <DropdownNext {...args}>
      <OptionGroup label="US">
        <Option value="Chicago">Chicago</Option>
        <Option value="Miami">Miami</Option>
        <Option value="New York">New York</Option>
      </OptionGroup>
      <OptionGroup label="UK">
        <Option value="Liverpool">Liverpool</Option>
        <Option value="London">London</Option>
        <Option value="Manchester">Manchester</Option>
      </OptionGroup>
    </DropdownNext>
  );
};

const adornmentMap: Record<string, JSX.Element> = {
  GB: <GB aria-hidden size={0.75} />,
  US: <US aria-hidden size={0.75} />,
};

export const ComplexOption: StoryFn<typeof DropdownNext> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
    args.onSelectionChange?.(event, newSelected);
  };

  const adornment = adornmentMap[selected[0] ?? ""] || null;

  return (
    <DropdownNext
      {...args}
      selected={selected}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
    >
      <Option
        value="GB"
        textValue="United Kingdom of Great Britain and Northern Ireland"
      >
        <GB size={0.75} aria-hidden /> United Kingdom of Great Britain and
        Northern Ireland
      </Option>
      <Option value="US" textValue="United States of America">
        <US size={0.75} aria-hidden /> United States of America
      </Option>
    </DropdownNext>
  );
};

export const LongList: StoryFn<typeof DropdownNext> = (args) => {
  return (
    <DropdownNext {...args}>
      {longUsStates.map((state) => (
        <Option value={state} key={state}>
          {state}
        </Option>
      ))}
    </DropdownNext>
  );
};

export const CustomValue: StoryFn<typeof DropdownNext> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
    args.onSelectionChange?.(event, newSelected);
  };

  return (
    <DropdownNext
      {...args}
      selected={selected}
      value={
        selected.length < 2 ? selected[0] : `${selected.length} items selected`
      }
      onSelectionChange={handleSelectionChange}
      multiselect
    >
      {usStates.map((state) => (
        <Option value={state} key={state}>
          {state}
        </Option>
      ))}
    </DropdownNext>
  );
};

export const Validation = () => {
  return (
    <StackLayout>
      <Template validationStatus="error" />
      <Template validationStatus="warning" />
      <Template validationStatus="success" />
    </StackLayout>
  );
};

export const WithStartAdornment = Template.bind({});
WithStartAdornment.args = {
  startAdornment: <GB aria-hidden size={0.75} />,
};
