import { Panel } from "@brandname/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { AllRenderer } from "../components";

export default {
  title: "Lab/Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => <Panel {...args} />;

export const Low = Template.bind({});
Low.args = {
  children: "Lorem Ipsum",
  emphasis: "low",
};

export const Medium = Template.bind({});
Medium.args = {
  children: "Lorem Ipsum",
  emphasis: "medium",
};

export const All: ComponentStory<typeof Panel> = (props) => {
  return (
    <>
      <h1>Primary</h1>
      <AllRenderer>
        <Panel emphasis="low" {...props} />
      </AllRenderer>
      <h1>Secondary</h1>
      <AllRenderer>
        <Panel emphasis="medium" {...props} />
      </AllRenderer>
    </>
  );
};
All.args = {
  children: <p>Lorem Ipsum</p>,
};
