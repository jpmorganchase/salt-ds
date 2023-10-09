import { ChangeEvent, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Switch } from "@salt-ds/lab";

export default {
  title: "Lab/Switch",
  component: Switch,
} as Meta<typeof Switch>;

const Template: StoryFn<typeof Switch> = (args) => {
  return <Switch {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  label: "Default",
};

export const Checked = Template.bind({});

Checked.args = {
  defaultChecked: true,
  label: "Checked",
};

export const Disabled = Template.bind({});

Disabled.args = {
  disabled: true,
  label: "Disabled",
};

export const DisabledChecked = Template.bind({});

DisabledChecked.args = {
  disabled: true,
  defaultChecked: true,
  label: "Disabled + Checked",
};

export const Controlled: StoryFn<typeof Switch> = (args) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  return <Switch {...args} checked={checked} onChange={handleChange} />;
};

Controlled.args = {
  label: "Controlled",
};
