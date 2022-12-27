import { Badge } from "@salt-ds/lab";

import { ClockIcon, SettingsSolidIcon, UserBadgeIcon } from "@salt-ds/icons";

import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Badge",
  component: Badge,
} as Meta<typeof Badge>;

export const All: StoryFn<typeof Badge> = () => {
  return (
    <div style={{ display: "inline-block" }}>
      <div>
        <Badge badgeContent={1}>
          <SettingsSolidIcon />
        </Badge>
        <Badge badgeContent={6}>
          <UserBadgeIcon />
        </Badge>
        <Badge badgeContent={8}>
          <ClockIcon />
        </Badge>
        <Badge badgeContent={999} />
      </div>
      <div>
        <Badge badgeContent={1}>Lorem Ipsum</Badge>
        <Badge badgeContent={10}>Lorem Ipsum</Badge>
        <Badge badgeContent={100}>Lorem Ipsum</Badge>
        <Badge badgeContent={2000}>Lorem Ipsum</Badge>
        <Badge badgeContent={2000} max={99}>
          Lorem Ipsum
        </Badge>
      </div>
    </div>
  );
};

const Template: StoryFn<typeof Badge> = (args) => {
  return <Badge {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  max: 1000,
  badgeContent: 1,
  children: <SettingsSolidIcon />,
};

export const Words = Template.bind({});
Words.args = {
  max: 1000,
  badgeContent: 1,
  children: "Words Badge",
};

export const Text = Template.bind({});
Text.args = {
  badgeContent: "Text",
  children: "Text Badge",
};

export const MaxNumber = Template.bind({});
MaxNumber.args = {
  max: 99,
  badgeContent: 150,
  children: <UserBadgeIcon />,
};
