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

export const Bold = TagTemplate.bind({});
Bold.args = {
  children: (
    <>
      <NotificationIcon /> Bold
    </>
  ),
};

export const Subtle = TagTemplate.bind({});
Subtle.args = {
  emphasis: "subtle",
  children: (
    <>
      <NotificationIcon /> Subtle
    </>
  ),
};

export const Bordered = TagTemplate.bind({});
Bordered.args = {
  emphasis: "subtle",
  bordered: true,
  children: (
    <>
      <NotificationIcon /> Bordered
    </>
  ),
};
