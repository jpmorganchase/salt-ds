// TODO revisit when:
//  - multiline is implemented for Input

import { NotificationIcon } from "@salt-ds/icons";
import { FormField, SearchInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { SyntheticEvent, useState } from "react";

export default {
  title: "Lab/SearchInput",
  component: SearchInput,
} as Meta<typeof SearchInput>;

const Template: StoryFn<typeof SearchInput> = (args) => {
  return <SearchInput style={{ width: "292px" }} {...args} />;
};

export const DefaultIcon = Template.bind({});

export const DefaultValue = Template.bind({});

DefaultValue.args = {
  defaultValue: "default value",
};

export const CustomIcon = Template.bind({});

CustomIcon.args = {
  defaultValue: "default value",
  IconComponent: NotificationIcon,
};

export const DefaultValueNoIcon = Template.bind({});

DefaultValueNoIcon.args = {
  defaultValue: "default value",
  IconComponent: undefined,
};

export const Controlled: StoryFn<typeof SearchInput> = ({
  onChange,
  onClear,
  ...args
}) => {
  const [value, setValue] = useState("test");
  const handleChange = (event: SyntheticEvent<unknown>, value: string) => {
    setValue(value);
    onChange?.(event, value);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
  };

  return (
    <SearchInput
      style={{ width: "292px" }}
      onChange={handleChange}
      onClear={handleClear}
      value={value}
      {...args}
    />
  );
};

export const WithFormField: StoryFn<typeof SearchInput> = (args) => {
  return (
    <FormField label="ADA compliant label" style={{ width: "292px" }}>
      <SearchInput inputProps={{ autoComplete: "off" }} {...args} />
    </FormField>
  );
};

export const WithFormFieldNoIcon: StoryFn<typeof SearchInput> = (args) => {
  return (
    <FormField label="ADA compliant label" style={{ width: "292px" }}>
      <SearchInput
        IconComponent={null}
        inputProps={{ autoComplete: "off" }}
        {...args}
      />
    </FormField>
  );
};
