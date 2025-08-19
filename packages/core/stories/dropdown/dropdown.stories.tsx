import {
  Dropdown,
  type DropdownProps,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  OptionGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";

import {
  EditIcon,
  GuideClosedIcon,
  LocationIcon,
  UserAdminIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type SyntheticEvent, useState } from "react";

export default {
  title: "Core/Dropdown",
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

const Template: StoryFn<DropdownProps> = (args) => {
  return (
    <Dropdown {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state} />
      ))}
    </Dropdown>
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

export const DisabledOption: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown {...args}>
      {usStates.map((state) => (
        <Option value={state} key={state} disabled={state === "California"} />
      ))}
    </Dropdown>
  );
};

export const Variants: StoryFn<typeof Dropdown> = () => {
  return (
    <StackLayout>
      <Dropdown>
        {usStates.map((state) => (
          <Option value={state} key={state} />
        ))}
      </Dropdown>
      <Dropdown variant="secondary">
        {usStates.map((state) => (
          <Option value={state} key={state} />
        ))}
      </Dropdown>
    </StackLayout>
  );
};

export const Multiselect = Template.bind({});
Multiselect.args = {
  multiselect: true,
};

export const WithFormField: StoryFn = () => {
  return (
    <FormField>
      <FormFieldLabel>State</FormFieldLabel>
      <Dropdown>
        {usStates.map((state) => (
          <Option value={state} key={state} />
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
        <Option value="Chicago" />
        <Option value="Miami" />
        <Option value="New York" />
      </OptionGroup>
      <OptionGroup label="UK">
        <Option value="Liverpool" />
        <Option value="London" />
        <Option value="Manchester" />
      </OptionGroup>
    </Dropdown>
  );
};

const permissions: Record<
  string,
  { icon: JSX.Element; name: string; description: string }
> = {
  read: {
    icon: <GuideClosedIcon aria-hidden />,
    name: "Read",
    description: "Read only",
  },
  write: {
    icon: <EditIcon aria-hidden />,
    name: "Write",
    description: "Read and write only",
  },
  admin: {
    icon: <UserAdminIcon aria-hidden />,
    name: "Admin",
    description: "Full access",
  },
};

export const ComplexOption: StoryFn<DropdownProps> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected,
  ) => {
    setSelected(newSelected);
    args.onSelectionChange?.(event, newSelected);
  };

  const adornment = permissions[selected[0] ?? ""]?.icon || null;

  return (
    <Dropdown
      {...args}
      selected={selected}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
      valueToString={(item) => permissions[item].name}
    >
      {Object.values(permissions).map(({ name, icon, description }) => (
        <Option value={name.toLowerCase()} key={name.toLowerCase()}>
          <StackLayout direction="row" gap={1}>
            {icon}
            <StackLayout gap={0.5} align="start">
              <Text>{name}</Text>
              <Text styleAs="label" color="secondary">
                {description}
              </Text>
            </StackLayout>
          </StackLayout>
        </Option>
      ))}
    </Dropdown>
  );
};

export const LongList: StoryFn<typeof Dropdown> = (args) => {
  return (
    <Dropdown {...args}>
      {longUsStates.map((state) => (
        <Option value={state} key={state} />
      ))}
    </Dropdown>
  );
};

export const CustomValue: StoryFn<DropdownProps> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected,
  ) => {
    setSelected(newSelected);
    args.onSelectionChange?.(event, newSelected);
  };

  return (
    <Dropdown
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
    </Dropdown>
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

export const ObjectValue: StoryFn<DropdownProps<Person>> = () => {
  const [selected, setSelected] = useState<Person[]>([]);
  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: Person[],
  ) => {
    setSelected(newSelected);
  };

  return (
    <Dropdown<Person>
      onSelectionChange={handleSelectionChange}
      selected={selected}
      multiselect
      valueToString={(person) => person.displayName}
    >
      {people.map((person) => (
        <Option value={person} key={person.id} />
      ))}
    </Dropdown>
  );
};
export const SelectAll: StoryFn<DropdownProps> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelectedOptionValue = "all";

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected,
  ) => {
    let newOptionsSelected = [...newSelected];
    const allWasPreviousSelected = selected.includes(allSelectedOptionValue);
    const allIsCurrentlySelected = newOptionsSelected.includes(
      allSelectedOptionValue,
    );

    // If all was unselected
    if (allWasPreviousSelected && !allIsCurrentlySelected) {
      newOptionsSelected = [];
      // If an option was unselected (-1 to not include "all")
    } else if (
      allWasPreviousSelected &&
      newOptionsSelected.length - 1 !== usStates.length
    ) {
      newOptionsSelected = newOptionsSelected.filter(
        (el) => el !== allSelectedOptionValue,
      );
      // If all was selected or all options are now selected
    } else if (
      allIsCurrentlySelected ||
      (!allIsCurrentlySelected && newOptionsSelected.length === usStates.length)
    ) {
      newOptionsSelected = [allSelectedOptionValue, ...usStates];
    }

    setSelected(newOptionsSelected);
    args.onSelectionChange?.(event, newOptionsSelected);
  };

  return (
    <Dropdown
      {...args}
      style={{ width: "266px" }}
      selected={selected}
      value={
        selected.length < 2
          ? selected[0]
          : selected.includes("all")
            ? "All Selected"
            : `${selected.length} items selected`
      }
      onSelectionChange={handleSelectionChange}
      multiselect
    >
      <div>
        <Option
          style={{
            borderBottom: "var(--salt-borderStyle-solid)",
            borderWidth: "var(--salt-size-fixed-100)",
            borderColor:
              selected.includes(usStates[0]) ||
              selected.includes(allSelectedOptionValue)
                ? "transparent"
                : "var(--salt-separable-tertiary-borderColor)",
          }}
          value={allSelectedOptionValue}
        >
          Select All
        </Option>
      </div>
      {usStates.map((state) => (
        <Option value={state} key={state} />
      ))}
    </Dropdown>
  );
};

export const Bordered = () => {
  return (
    <StackLayout>
      <Template bordered />
      <Template bordered variant="secondary" />
      <Template bordered validationStatus="error" />
      <Template bordered validationStatus="warning" />
      <Template bordered validationStatus="success" />
    </StackLayout>
  );
};
