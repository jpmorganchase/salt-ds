import { Dropdown, Option, OptionGroup } from "@salt-ds/lab";

import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { GB, US } from "@salt-ds/countries";

export default {
  title: "Lab/Dropdown",
  component: Dropdown,
} as Meta<typeof Dropdown>;

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

const Template: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state}>
          {state}
        </Option>
      ))}
    </Dropdown>
  );
};

export const Default = Template.bind({});

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: "Select a state",
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

export const DisabledOption: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state} disabled={state === "California"}>
          {state}
        </Option>
      ))}
    </Dropdown>
  );
};

export const Variants: StoryFn<typeof Dropdown> = () => {
  return (
    <StackLayout>
      <Dropdown>
        {usStates.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </Dropdown>
      <Dropdown variant="secondary">
        {usStates.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </Dropdown>
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
      <Dropdown>
        {usStates.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </Dropdown>
      <FormFieldHelperText>Pick a US state</FormFieldHelperText>
    </FormField>
  );
};

export const Grouped: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown {...args}>
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
    </Dropdown>
  );
};

export const ComplexOption: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown style={{ width: 200 }} {...args}>
      <Option
        value="GB"
        textValue="United Kingdom of Great Britain and Northern Ireland"
      >
        <GB /> United Kingdom of Great Britain and Northern Ireland
      </Option>
      <Option value="US" textValue="United States of America">
        <US /> United States of America
      </Option>
    </Dropdown>
  );
};

export const LongList: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown {...args}>
      {longUsStates.map((state) => (
        <Option value={state} key={state}>
          {state}
        </Option>
      ))}
    </Dropdown>
  );
};
