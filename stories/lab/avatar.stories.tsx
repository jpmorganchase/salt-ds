import { Avatar } from "@brandname/lab";

import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "../assets/placeholder.svg";

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
