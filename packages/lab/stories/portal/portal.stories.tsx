import { Portal } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Portal",
  component: Portal,
} as ComponentMeta<typeof Portal>;

export const PortalExample: ComponentStory<typeof Portal> = (args) => {
  return <Portal {...args} container={document.querySelector('#root')}><div style={{ border: '1px solid gray' }}>Portal content</div></Portal>;
};
