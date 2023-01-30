import { Avatar } from "@salt-ds/lab";

import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";
import { FlowLayout } from "../../core";

export default {
  title: "Lab/Avatar",
  component: Avatar,
} as ComponentMeta<typeof Avatar>;
const sizes = [1, 2, 3] as const;

const Template: ComponentStory<typeof Avatar> = (props) => {
  return (
    <FlowLayout gap={4} align="baseline">
      {sizes.map((size) => (
        <div>
          <Avatar {...props} size={size} />
          <p>{size}x</p>
        </div>
      ))}
    </FlowLayout>
  );
};

export const Default = Template.bind({});

export const Initials = Template.bind({});
Initials.args = {
  children: "SB",
};
g;
export const Image = Template.bind({});
Image.args = {
  src: PlaceholderLogo as string,
  alt: "Logo",
};
