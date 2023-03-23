import { ChangeEvent, useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Switch } from "@salt-ds/lab";

export default {
  title: "Lab/Switch",
  component: Switch,
} as ComponentMeta<typeof Switch>;

export const AllVariations = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Switch label="Default" />
      <Switch label="Checked" checked />
      <Switch label="Disabled" disabled />
      <Switch label="Checked Disabled" checked disabled />
    </div>
  );
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
