import { ToggleButtonGroup, ToggleButton } from "@salt-ds/lab";
import {
  NotificationIcon,
  HomeIcon,
  SearchIcon,
  PrintIcon,
  FavoriteSolidIcon,
} from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Tooltip } from "@salt-ds/core";

export default {
  title: "Lab/Toggle Button",
  component: ToggleButtonGroup,
  subcomponents: { ToggleButton },
  args: {
    defaultSelected: "alert",
  },
} as ComponentMeta<typeof ToggleButtonGroup>;

const IconAndTextTemplate: ComponentStory<typeof ToggleButtonGroup> = (
  args
) => {
  return (
    <ToggleButtonGroup {...args}>
      <ToggleButton value="alert">
        <NotificationIcon aria-hidden /> Alert
      </ToggleButton>
      <ToggleButton disabled value="home">
        <HomeIcon aria-hidden /> Home
      </ToggleButton>
      <ToggleButton value="search">
        <SearchIcon aria-hidden /> Search
      </ToggleButton>
      <ToggleButton value="print">
        <PrintIcon aria-hidden /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

const IconOnlyTemplate: ComponentStory<typeof ToggleButtonGroup> = (args) => {
  return (
    <ToggleButtonGroup {...args}>
      <Tooltip content="Alert" placement="bottom">
        <ToggleButton value="alert" aria-label="Alert">
          <NotificationIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip content="Home" placement="bottom">
        <ToggleButton disabled value="home" aria-label="Home">
          <HomeIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip content="Search" placement="bottom">
        <ToggleButton value="search" aria-label="Search">
          <SearchIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip content="Print" placement="bottom">
        <ToggleButton value="print" aria-label="Print">
          <PrintIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

const TextOnlyTemplate: ComponentStory<typeof ToggleButtonGroup> = (args) => {
  return (
    <ToggleButtonGroup {...args}>
      <ToggleButton value="alert">Alert</ToggleButton>
      <ToggleButton disabled value="home">
        Home
      </ToggleButton>
      <ToggleButton value="search">Search</ToggleButton>
      <ToggleButton value="print">Print</ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Single: ComponentStory<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <FavoriteSolidIcon />
  </ToggleButton>
);

export const Horizontal = IconAndTextTemplate.bind({});

export const HorizontalIconOnly = IconOnlyTemplate.bind({});

export const HorizontalTextOnly = TextOnlyTemplate.bind({});

export const Vertical = IconAndTextTemplate.bind({});

Vertical.args = {
  orientation: "vertical",
};

export const VerticalIconOnly = IconOnlyTemplate.bind({});

VerticalIconOnly.args = {
  orientation: "vertical",
};

export const VerticalTextOnly = TextOnlyTemplate.bind({});

VerticalTextOnly.args = {
  orientation: "vertical",
};

export const Disabled = IconAndTextTemplate.bind({});
Disabled.args = {
  disabled: true,
};
