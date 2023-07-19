import { Badge } from "@salt-ds/lab";
import { Tab } from "@salt-ds/lab";

import { ClockIcon, SettingsSolidIcon, UserBadgeIcon } from "@salt-ds/icons";

import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Badge",
  component: Badge,
} as ComponentMeta<typeof Badge>;

export const All: ComponentStory<typeof Badge> = () => {
  return (
    <div style={{ display: "inline-block" }}>
      <div>
        <Badge value={1}>
          <SettingsSolidIcon />
        </Badge>
        <Badge value={6}>
          <UserBadgeIcon />
        </Badge>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          List Item
          <Badge value={8} />
        </div>
        <Badge value={999} />
      </div>
      <div>
        <Badge value={1}>Lorem Ipsum</Badge>
        <Badge value={10}>Lorem Ipsum</Badge>
        <Badge value={100}>Lorem Ipsum</Badge>
        <Badge value={2000}>Lorem Ipsum</Badge>
        <Badge value={2000} max={99}>
          Lorem Ipsum
        </Badge>
      </div>
    </div>
  );
};

const Template: ComponentStory<typeof Badge> = (args) => {
  return <Badge {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  value: 10,
  children: <SettingsSolidIcon />,
};

export const MaxNumber = Template.bind({});
MaxNumber.args = {
  max: 99,
  value: 150,
  children: "Lorem Ipsum",
};

export const String = Template.bind({});
String.args = {
  value: "lots and lots",
  children: "Lorem Ipsum",
};

export const Words = Template.bind({});
Words.args = {
  max: 1000,
  value: 1,
  children: "Lorem Ipsum",
};

export const Standalone = Template.bind({});
Standalone.args = {
  value: "test",
};
