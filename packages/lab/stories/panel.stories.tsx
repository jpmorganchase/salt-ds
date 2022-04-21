import { Panel } from "@jpmorganchase/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Lab/Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => <Panel {...args} />;

export const Medium = Template.bind({});
Medium.args = {
  children: "Lorem Ipsum",
  emphasis: "medium",
};

export const High = Template.bind({});
High.args = {
  children: "Lorem Ipsum",
  emphasis: "high",
};

export const All: ComponentStory<typeof Panel> = (props) => {
  return (
    <>
      <h1>Medium emphasis</h1>
      <AllRenderer>
        <Panel {...props} />
      </AllRenderer>
      <h1>High emphasis</h1>
      <AllRenderer>
        <Panel emphasis="high" {...props} />
      </AllRenderer>
    </>
  );
};
All.args = {
  children: <p>Lorem Ipsum</p>,
};
