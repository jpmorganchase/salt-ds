import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  Switch,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

export default {
  title: "Core/Switch",
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

// export const Readonly = Template.bind({});

// Readonly.args = {
//   readOnly: true,
//   label: "Readonly",
// };

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

export const WithFormField: StoryFn<typeof Switch> = (args) => {
  return (
    <StackLayout direction="row">
      <FormField labelPlacement="left">
        <FormFieldLabel>Label</FormFieldLabel>
        <Switch {...args} />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};

export const Readonly: StoryFn<typeof Switch> = (args) => (
  <StackLayout gap={1}>
    <Switch {...args} readOnly defaultChecked label="Read only and checked" />
    <Switch {...args} readOnly label="Read only" />
  </StackLayout>
);
