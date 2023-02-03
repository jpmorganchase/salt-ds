import { Panel } from "@salt-ds/core";
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
  children: <p>Lorem Ipsum</p>,
};

export const Primary = Template.bind({});
Primary.args = {
  children: "Lorem Ipsum",
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: "Lorem Ipsum",
  variant: "secondary",
};