import { Badge } from "@brandname/lab";
import { ClockIcon, SettingsSolidIcon, UserBadgeIcon } from "@brandname/icons";

import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Badge",
  component: Badge,
} as ComponentMeta<typeof Badge>;

export const AllBadges: ComponentStory<typeof Badge> = () => {
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
        <Badge badgeContent={2000} variant="error">
          Lorem Ipsum
        </Badge>
        <Badge badgeContent={2000} max={99} variant="success">
          Lorem Ipsum
        </Badge>
      </div>
    </div>
  );
};

const Template: ComponentStory<typeof Badge> = (args) => {
  return <Badge {...args} />;
};

export const DefaultBadge = Template.bind({});

DefaultBadge.args = {
  max: 1000,
  badgeContent: 1,
  children: <SettingsSolidIcon />,
};

export const WordsBadge = Template.bind({});

WordsBadge.args = {
  max: 1000,
  badgeContent: 1,
  children: "Lorem Ipsum",
};
