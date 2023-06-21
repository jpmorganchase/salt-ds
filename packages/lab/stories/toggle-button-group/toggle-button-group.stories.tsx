import { ToggleButtonGroup, ToggleButton } from "@salt-ds/lab";
import {
  LightIcon,
  DarkIcon,
  AppSwitcherIcon,
  FolderClosedIcon,
  VisibleIcon,
} from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Tooltip } from "@salt-ds/core";

export default {
  title: "Lab/Toggle Button Group",
  component: ToggleButtonGroup,
  subcomponents: { ToggleButton },
} as ComponentMeta<typeof ToggleButtonGroup>;

const IconAndTextTemplate: ComponentStory<typeof ToggleButtonGroup> = (
  args
) => {
  return (
    <ToggleButtonGroup {...args}>
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

const IconOnlyTemplate: ComponentStory<typeof ToggleButtonGroup> = (args) => {
  return (
    <ToggleButtonGroup aria-label="Modes" {...args}>
      <Tooltip content="Light Mode" placement="bottom">
        <ToggleButton value="light" aria-label="Light Mode">
          <LightIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip content="Dark Mode" placement="bottom">
        <ToggleButton value="dark" aria-label="Dark Mode">
          <DarkIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

const TextOnlyTemplate: ComponentStory<typeof ToggleButtonGroup> = (args) => {
  return (
    <ToggleButtonGroup aria-label="Densities" {...args}>
      <ToggleButton value="high" aria-label="High Density">
        High
      </ToggleButton>
      <ToggleButton disabled value="medium" aria-label="Medium Density">
        Medium
      </ToggleButton>
      <ToggleButton value="low" aria-label="Low Density">
        Low
      </ToggleButton>
      <ToggleButton value="touch" aria-label="Touch Density">
        Touch
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Horizontal = IconAndTextTemplate.bind({});

export const HorizontalIconOnly = IconOnlyTemplate.bind({});

HorizontalIconOnly.args = {
  defaultSelected: "light",
};

export const HorizontalTextOnly = TextOnlyTemplate.bind({});

HorizontalTextOnly.args = {
  defaultSelected: "high",
};

export const Vertical = IconAndTextTemplate.bind({});

Vertical.args = {
  orientation: "vertical",
};

export const VerticalIconOnly = IconOnlyTemplate.bind({});

VerticalIconOnly.args = {
  orientation: "vertical",
  defaultSelected: "light",
};

export const VerticalTextOnly = TextOnlyTemplate.bind({});

VerticalTextOnly.args = {
  orientation: "vertical",
  defaultSelected: "high",
};

export const Disabled = IconAndTextTemplate.bind({});
Disabled.args = {
  disabled: true,
};
