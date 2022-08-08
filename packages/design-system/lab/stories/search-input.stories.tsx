// TODO revisit when:
//  - multiline is implemented for Input

import { FormField } from "@jpmorganchase/uitk-core";
import { NotificationIcon } from "@jpmorganchase/uitk-icons";
import { SearchInput } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { SyntheticEvent, useState } from "react";

export default {
  title: "Lab/SearchInput",
  component: SearchInput,
} as ComponentMeta<typeof SearchInput>;

const Template: ComponentStory<typeof SearchInput> = (args) => {
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

export const Controlled: ComponentStory<typeof SearchInput> = ({
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

export const WithFormField: ComponentStory<typeof SearchInput> = (args) => {
  return (
    <FormField label="ADA compliant label" style={{ width: "292px" }}>
      <SearchInput inputProps={{ autoComplete: "off" }} {...args} />
    </FormField>
  );
};

export const WithFormFieldNoIcon: ComponentStory<typeof SearchInput> = (
  args
) => {
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
