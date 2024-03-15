import {
  DropdownNext,
  DropdownNextProps,
  Option,
  OptionGroup,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";

import { Meta, StoryFn } from "@storybook/react";
import { GB, US } from "@salt-ds/countries";
import { SyntheticEvent, useState } from "react";
import { LocationIcon } from "@salt-ds/icons";

export default {
  title: "Core/Dropdown Next",
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

const Template: StoryFn<DropdownNextProps> = (args) => {
  return (
    <DropdownNext {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state} />
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
};

export const Readonly = Template.bind({});
Readonly.args = {
  readOnly: true,
  defaultSelected: ["California"],
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  defaultSelected: ["California"],
};

export const DisabledOption: StoryFn<typeof DropdownNext> = (args) => {
  return (
    <DropdownNext {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state} disabled={state === "California"} />
      ))}
    </DropdownNext>
  );
};

export const Variants: StoryFn<typeof DropdownNext> = () => {
  return (
    <StackLayout>
      <DropdownNext>
        {usStates.map((state) => (
          <Option value={state} key={state} />
        ))}
      </DropdownNext>
      <DropdownNext variant="secondary">
        {usStates.map((state) => (
          <Option value={state} key={state} />
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
          <Option value={state} key={state} />
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
        <Option value="Chicago" />
        <Option value="Miami" />
        <Option value="New York" />
      </OptionGroup>
      <OptionGroup label="UK">
        <Option value="Liverpool" />
        <Option value="London" />
        <Option value="Manchester" />
      </OptionGroup>
    </DropdownNext>
  );
};

const countries: Record<string, { icon: JSX.Element; name: string }> = {
  GB: {
    icon: <GB aria-hidden size={0.75} />,
    name: "United Kingdom of Great Britain and Northern Ireland",
  },
  US: {
    icon: <US aria-hidden size={0.75} />,
    name: "United States of America",
  },
};

export const ComplexOption: StoryFn<DropdownNextProps> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
    args.onSelectionChange?.(event, newSelected);
  };

  const adornment = countries[selected[0] ?? ""]?.icon || null;

  return (
    <DropdownNext
      {...args}
      selected={selected}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
      valueToString={(item) => countries[item].name}
    >
      <Option value="GB">
        <GB size={0.75} aria-hidden /> United Kingdom of Great Britain and
        Northern Ireland
      </Option>
      <Option value="US">
        <US size={0.75} aria-hidden /> United States of America
      </Option>
    </DropdownNext>
  );
};

export const LongList: StoryFn<typeof DropdownNext> = (args) => {
  return (
    <DropdownNext {...args}>
      {longUsStates.map((state) => (
        <Option value={state} key={state} />
      ))}
    </DropdownNext>
  );
};

export const CustomValue: StoryFn<DropdownNextProps> = (args) => {
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
        <Option value={state} key={state} />
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
  startAdornment: <LocationIcon />,
};

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
}

const people: Person[] = [
  { id: 1, firstName: "John", lastName: "Doe", displayName: "John Doe" },
  { id: 2, firstName: "Jane", lastName: "Doe", displayName: "Jane Doe" },
  { id: 3, firstName: "John", lastName: "Smith", displayName: "John Smith" },
  { id: 4, firstName: "Jane", lastName: "Smith", displayName: "Jane Smith" },
];

export const ObjectValue: StoryFn<DropdownNextProps<Person>> = (args) => {
  const [selected, setSelected] = useState<Person[]>([]);
  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: Person[]
  ) => {
    setSelected(newSelected);
  };

  return (
    <DropdownNext<Person>
      onSelectionChange={handleSelectionChange}
      selected={selected}
      multiselect
      valueToString={(person) => person.displayName}
    >
      {people.map((person) => (
        <Option value={person} key={person.id} />
      ))}
    </DropdownNext>
  );
};
