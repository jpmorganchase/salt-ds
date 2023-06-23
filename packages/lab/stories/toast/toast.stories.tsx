import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Toast } from "@salt-ds/lab";

export default {
  title: "Lab/Toast",
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = (args) => {
  return (
    <Toast {...args}>
      <div>Info title</div>
      <div>LEI Updated</div>
    </Toast>
  );
};

export const Default = Template.bind({});
