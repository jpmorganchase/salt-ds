import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupSurplus } from "@salt-ds/lab";
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
    <AvatarGroup {...args}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <AvatarGroupSurplus name="1 more">+1</AvatarGroupSurplus>
    </AvatarGroup>
  );
};

export const RenderProp: StoryFn<typeof AvatarGroup> = (args) => {
  return (
    <AvatarGroup
      render={<CustomAvatarButton aria-label="Avatar group" />}
      {...args}
    >
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <AvatarGroupSurplus name="1 more">+1</AvatarGroupSurplus>
    </AvatarGroup>
  );
};
