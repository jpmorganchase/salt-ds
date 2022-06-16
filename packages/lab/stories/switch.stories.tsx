import { ChangeEvent, useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel, ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Switch } from "@jpmorganchase/uitk-lab";

import "./Switch.stories.newapp-switch.css";

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

export const CustomStyling: ComponentStory<typeof Switch> = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
    <ToolkitProvider density="high" theme={["light", "newapp"]}>
      <Panel>
        <FeatureSwitch label="Custom styling" />
      </Panel>
    </ToolkitProvider>
    <ToolkitProvider density="medium" theme={["dark", "newapp"]}>
      <Panel>
        <FeatureSwitch label="Custom styling" defaultChecked />
      </Panel>
    </ToolkitProvider>

    <ToolkitProvider density="low" theme={["light", "newapp"]}>
      <Panel>
        <FeatureSwitch label="Custom styling" />
      </Panel>
    </ToolkitProvider>
    <ToolkitProvider density="touch" theme={["dark", "newapp"]}>
      <Panel>
        <FeatureSwitch label="Custom styling" defaultChecked />
      </Panel>
    </ToolkitProvider>
  </div>
);
