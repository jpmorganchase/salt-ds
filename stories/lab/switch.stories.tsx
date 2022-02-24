import { ChangeEvent, useState } from "react";
import { Switch } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Switch",
  component: Switch,
} as ComponentMeta<typeof Switch>;

const Template: ComponentStory<typeof Switch> = (args) => {
  return <Switch {...args} />;
};

export const FeatureSwitch = Template.bind({});

FeatureSwitch.args = {
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

export const Controlled: ComponentStory<typeof Switch> = (args) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (
    _: ChangeEvent<HTMLInputElement>,
    isChecked: boolean
  ) => {
    setChecked(isChecked);
  };

  return <Switch {...args} checked={checked} onChange={handleChange} />;
};

Controlled.args = {
  label: "Controlled",
};
