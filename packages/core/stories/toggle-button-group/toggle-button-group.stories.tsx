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
  sentiment?: ToggleButtonProps["sentiment"];
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
    sentiment: {
      control: "select",
      options: ["accented", "neutral", "positive", "negative", "caution"],
    },
  },
} as Meta<ToggleButtonGroupStoryProps>;

const IconAndTextTemplate: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  sentiment,
  ...rest
}) => {
  return (
    <ToggleButtonGroup {...rest}>
      <ToggleButton appearance={appearance} sentiment={sentiment} value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        sentiment={sentiment}
        value="active"
      >
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        sentiment={sentiment}
        disabled
        value="search"
      >
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

const IconOnlyTemplate: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  orientation,
  sentiment,
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
          sentiment={sentiment}
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
          sentiment={sentiment}
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
  sentiment,
  ...rest
}) => {
  return (
    <ToggleButtonGroup aria-label="Densities" {...rest}>
      <ToggleButton
        appearance={appearance}
        sentiment={sentiment}
        value="high"
        aria-label="High Density"
      >
        High
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        sentiment={sentiment}
        disabled
        value="medium"
        aria-label="Medium Density"
      >
        Medium
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        sentiment={sentiment}
        value="low"
        aria-label="Low Density"
      >
        Low
      </ToggleButton>
      <ToggleButton
        appearance={appearance}
        sentiment={sentiment}
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

export const Bordered: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  ...rest
}) => {
  return (
    <ToggleButtonGroup
      appearance="bordered"
      aria-label="Purchase"
      defaultValue="sell"
      {...rest}
    >
      <ToggleButton appearance={appearance} value="buy">
        Buy
      </ToggleButton>
      <ToggleButton appearance={appearance} value="sell">
        Sell
      </ToggleButton>
      <ToggleButton appearance={appearance} value="hold">
        Hold
      </ToggleButton>
      <ToggleButton appearance={appearance} value="review">
        Review
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Disabled = IconAndTextTemplate.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledSelected = IconAndTextTemplate.bind({});
DisabledSelected.args = {
  disabled: true,
  defaultValue: "active",
};

export const Sentiment: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  ...rest
}) => {
  return (
    <ToggleButtonGroup
      sentiment="accented"
      aria-label="Purchase"
      defaultValue="buy"
      {...rest}
    >
      <ToggleButton appearance={appearance} value="buy">
        Buy
      </ToggleButton>
      <ToggleButton appearance={appearance} value="sell">
        Sell
      </ToggleButton>
      <ToggleButton appearance={appearance} value="hold">
        Hold
      </ToggleButton>
      <ToggleButton appearance={appearance} value="review">
        Review
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const MixedSentiment: StoryFn<ToggleButtonGroupStoryProps> = ({
  appearance,
  ...rest
}) => {
  return (
    <ToggleButtonGroup aria-label="Purchase" {...rest}>
      <ToggleButton appearance={appearance} sentiment="positive" value="buy">
        Buy
      </ToggleButton>
      <ToggleButton appearance={appearance} sentiment="negative" value="sell">
        Sell
      </ToggleButton>
      <ToggleButton appearance={appearance} sentiment="caution" value="hold">
        Hold
      </ToggleButton>
      <ToggleButton appearance={appearance} sentiment="neutral" value="review">
        Review
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
