import { GridLayout, Panel } from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Core/Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => <Panel {...args} />;

export const All: ComponentStory<typeof Panel> = (props) => {
  return (
    <>
      <h1>Primary</h1>
      <AllRenderer>
        <Panel {...props} />
      </AllRenderer>
      <h1>Secondary</h1>
      <AllRenderer>
        <Panel variant="secondary" {...props} />
      </AllRenderer>
    </>
  );
};

All.args = {
  children: <p>This is a Panel</p>,
};
All.argTypes = {
  children: { control: { type: null } },
};

export const Primary = Template.bind({});
Primary.args = {
  children: "This is a Panel",
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: "This is a Panel",
  variant: "secondary",
};

export const FixedHeightAndWidth: ComponentStory<typeof Panel> = () => (
  <Panel style={{ height: "500px", width: "800px" }} variant="secondary">
    <p>This is a Panel</p>
  </Panel>
);

export const PanelInGridLayout: ComponentStory<typeof Panel> = () => (
  <GridLayout columns={2}>
    <Panel style={{ width: "100vh" }}>
      <p>This is a Panel</p>
    </Panel>
    <Panel variant="secondary" style={{ width: "100vh" }}>
      <p>This is a Panel</p>
    </Panel>
  </GridLayout>
);
