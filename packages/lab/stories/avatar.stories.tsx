import { Avatar } from "@jpmorganchase/uitk-lab";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";

import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";

import "./avatar.stories.newapp-avatar.css";

export default {
  title: "Lab/Avatar",
  component: Avatar,
} as ComponentMeta<typeof Avatar>;

const Template: ComponentStory<typeof Avatar> = (props) => {
  return (
    <div>
      <h3>Size = small</h3>
      <Avatar {...props} size="small" />
      <h3>Size = medium</h3>
      <Avatar {...props} size="medium" />
      <h3>Size = large</h3>
      <Avatar {...props} size="large" />
    </div>
  );
};

export const Default = Template.bind({});

export const Initials = Template.bind({});
Initials.args = {
  children: "SB",
};

export const Image = Template.bind({});
Image.args = {
  src: PlaceholderLogo as string,
  alt: "Logo",
};

export const CustomStyling: ComponentStory<typeof Avatar> = () => (
  <>
    <ToolkitProvider theme={["light", "newapp"]}>
      <Avatar size="large" />
    </ToolkitProvider>
    <ToolkitProvider theme={["light", "newapp"]}>
      <Avatar size="large" alt="Logo" src="/docs/assets/placeholder.svg" />
    </ToolkitProvider>
    <ToolkitProvider theme={["light", "newapp"]}>
      <Avatar size="large">SB</Avatar>
    </ToolkitProvider>
    <ToolkitProvider theme={["dark", "newapp"]}>
      <Avatar size="large" />
    </ToolkitProvider>
    <ToolkitProvider theme={["dark", "newapp"]}>
      <Avatar size="large" alt="Logo" src="/docs/assets/placeholder.svg" />
    </ToolkitProvider>
    <ToolkitProvider theme={["dark", "newapp"]}>
      <Avatar size="large">SB</Avatar>
    </ToolkitProvider>
  </>
);
