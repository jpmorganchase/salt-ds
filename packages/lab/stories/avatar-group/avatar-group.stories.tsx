import { Avatar } from "@salt-ds/core";
import { AvatarGroup } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import persona1 from "../assets/avatar1.png";

export default {
  title: "Lab/Avatar Group",
  component: AvatarGroup,
} as Meta<typeof AvatarGroup>;

const CustomAvatarButton = (props: ComponentProps<"button">) => (
  <button type="button" {...props} />
);

export const Default: StoryFn<typeof AvatarGroup> = (args) => {
  return (
    <AvatarGroup max={3} {...args}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
    </AvatarGroup>
  );
};

export const RenderProp: StoryFn<typeof AvatarGroup> = (args) => {
  return (
    <AvatarGroup
      max={3}
      render={<CustomAvatarButton aria-label="Avatar group" />}
      {...args}
    >
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
    </AvatarGroup>
  );
};
