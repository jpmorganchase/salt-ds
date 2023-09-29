import { Tooltip, ToggleButtonGroup, ToggleButton } from "@salt-ds/core";
import {
  LightIcon,
  DarkIcon,
  AppSwitcherIcon,
  FolderClosedIcon,
  VisibleIcon,
} from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Toggle Button Group",
  component: ToggleButtonGroup,
  subcomponents: { ToggleButton },
} as Meta<typeof ToggleButtonGroup>;

const IconAndTextTemplate: StoryFn<typeof ToggleButtonGroup> = (args) => {
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

const IconOnlyTemplate: StoryFn<typeof ToggleButtonGroup> = (args) => {
  return (
    <ToggleButtonGroup aria-label="Modes" {...args}>
      <Tooltip
        content="Light Mode"
        placement={args.orientation === "vertical" ? "right" : "bottom"}
      >
        <ToggleButton value="light" aria-label="Light Mode">
          <LightIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip
        content="Dark Mode"
        placement={args.orientation === "vertical" ? "right" : "bottom"}
      >
        <ToggleButton value="dark" aria-label="Dark Mode">
          <DarkIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

const TextOnlyTemplate: StoryFn<typeof ToggleButtonGroup> = (args) => {
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
  defaultValue: "light",
};

export const HorizontalTextOnly = TextOnlyTemplate.bind({});

HorizontalTextOnly.args = {
  defaultValue: "high",
};

export const Vertical = IconAndTextTemplate.bind({});

Vertical.args = {
  orientation: "vertical",
};

export const VerticalIconOnly = IconOnlyTemplate.bind({});

VerticalIconOnly.args = {
  orientation: "vertical",
  defaultValue: "light",
};

export const VerticalTextOnly = TextOnlyTemplate.bind({});

VerticalTextOnly.args = {
  orientation: "vertical",
  defaultValue: "high",
};

export const Disabled = IconAndTextTemplate.bind({});
Disabled.args = {
  disabled: true,
};
