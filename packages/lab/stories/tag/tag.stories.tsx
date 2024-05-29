import { Tag } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { NotificationIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Tag",
  component: Tag,
} as Meta<typeof Tag>;

const TagTemplate: StoryFn<typeof Tag> = (args) => {
  return <Tag {...args} />;
};

export const Primary = TagTemplate.bind({});
Primary.args = {
  children: (
    <>
      <NotificationIcon /> Primary
    </>
  ),
};

export const Secondary = TagTemplate.bind({});
Secondary.args = {
  variant: "secondary",
  children: (
    <>
      <NotificationIcon /> Secondary
    </>
  ),
};

export const Tertiary = TagTemplate.bind({});
Tertiary.args = {
  variant: "tertiary",
  children: (
    <>
      <NotificationIcon /> Tertiary
    </>
  ),
};
