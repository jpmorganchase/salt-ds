import { Meta, StoryFn } from "@storybook/react";
import { NotificationIcon } from "@salt-ds/icons";
import { GridLayout, Tag } from "@salt-ds/core";

export default {
  title: "Core/Tag",
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

export const Bordered = TagTemplate.bind({});
Bordered.args = {
  bordered: true,
  children: (
    <>
      <NotificationIcon /> Bordered
    </>
  ),
};

export const Category: StoryFn<typeof Tag> = () => {
  return (
    <GridLayout rows={5} columns={4}>
      <Tag>Cat-1</Tag>
      <Tag category={2}>Cat-2</Tag>
      <Tag category={3}>Cat-3</Tag>
      <Tag category={4}>Cat-4</Tag>
      <Tag category={5}>Cat-5</Tag>
      <Tag category={6}>Cat-6</Tag>
      <Tag category={7}>Cat-7</Tag>
      <Tag category={8}>Cat-8</Tag>
      <Tag category={9}>Cat-9</Tag>
      <Tag category={10}>Cat-10</Tag>
      <Tag category={11}>Cat-11</Tag>
      <Tag category={12}>Cat-12</Tag>
      <Tag category={13}>Cat-13</Tag>
      <Tag category={14}>Cat-14</Tag>
      <Tag category={15}>Cat-15</Tag>
      <Tag category={16}>Cat-16</Tag>
      <Tag category={17}>Cat-17</Tag>
      <Tag category={18}>Cat-18</Tag>
      <Tag category={19}>Cat-19</Tag>
      <Tag category={20}>Cat-20</Tag>
    </GridLayout>
  );
};
