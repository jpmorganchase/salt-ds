import { Panel } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Core/Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => <Panel {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "Lorem Ipsum",
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: "Lorem Ipsum",
  variant: "secondary",
};

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
