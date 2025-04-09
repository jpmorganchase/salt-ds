import { ToggleButton, Tooltip } from "@salt-ds/core";
import { FavoriteSolidIcon, HomeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Toggle Button",
  component: ToggleButton,
} as Meta<typeof ToggleButton>;

export const IconOnly: StoryFn<typeof ToggleButton> = (args) => (
  <Tooltip content="Favorite">
    <ToggleButton aria-label="favorite" {...args}>
      <FavoriteSolidIcon />
    </ToggleButton>
  </Tooltip>
);

export const TextOnly: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>AND</ToggleButton>
);

export const TextAndIcon: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);

export const Disabled: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);

Disabled.args = {
  disabled: true,
};

export const DisabledSelected: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);

DisabledSelected.args = {
  disabled: true,
  selected: true,
};

export const Sentiment: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);

Sentiment.args = {
  sentiment: "accented",
};
