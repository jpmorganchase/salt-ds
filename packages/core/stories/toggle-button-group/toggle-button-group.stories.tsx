import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
  Tooltip,
} from "@salt-ds/core";
import {
  AppSwitcherIcon,
  DarkIcon,
  FolderClosedIcon,
  LightIcon,
  VisibleIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";

interface ToggleButtonGroupStoryProps extends ToggleButtonGroupProps {
  appearance?: ToggleButtonProps["appearance"];
}

export default {
  title: "Core/Toggle Button Group",
  component: ToggleButtonGroup,
  subcomponents: { ToggleButton },

  argTypes: {
    appearance: {
      control: "select",
      options: ["solid", "bordered"],
    },
  },
} as Meta<ToggleButtonGroupStoryProps>;

const IconAndTextTemplate: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  ...rest
}) => {
  return (
    <ToggleButtonGroup {...rest}>
      <ToggleButton appearance={appearance} value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton appearance={appearance} value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton appearance={appearance} disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

const IconOnlyTemplate: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  orientation,
  ...rest
}) => {
  return (
    <ToggleButtonGroup aria-label="Modes" orientation={orientation} {...rest}>
      <Tooltip
        content="Light Mode"
        placement={orientation === "vertical" ? "right" : "bottom"}
      >
        <ToggleButton
          appearance={appearance}
          value="light"
          aria-label="Light Mode"
        >
          <LightIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip
        content="Dark Mode"
        placement={orientation === "vertical" ? "right" : "bottom"}
      >
        <ToggleButton
          appearance={appearance}
          value="dark"
          aria-label="Dark Mode"
        >
          <DarkIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

const TextOnlyTemplate: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  ...rest
}) => {
  return (
    <ToggleButtonGroup aria-label="Densities" {...rest}>
      <ToggleButton
        appearance={appearance}
        value="high"
        aria-label="High Density"
      >
        High
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        disabled
        value="medium"
        aria-label="Medium Density"
      >
        Medium
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        value="low"
        aria-label="Low Density"
      >
        Low
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        value="touch"
        aria-label="Touch Density"
      >
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

export const MixedSentiment: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
}) => {
  return (
    <ToggleButtonGroup aria-label="Purchase">
      <ToggleButton appearance={appearance} sentiment="positive" value="buy">
        Buy
      </ToggleButton>
      <ToggleButton appearance={appearance} sentiment="negative" value="sell">
        Sell
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
