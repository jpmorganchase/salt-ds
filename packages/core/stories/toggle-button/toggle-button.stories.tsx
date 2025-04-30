import { FlowLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import { FavoriteIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Toggle Button",
  component: ToggleButton,
} as Meta<typeof ToggleButton>;

export const IconOnly: StoryFn<typeof ToggleButton> = (args) => (
  <Tooltip content="Favorite">
    <ToggleButton {...args}>
      <FavoriteIcon aria-hidden />
    </ToggleButton>
  </Tooltip>
);

export const TextOnly: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>Toggle button</ToggleButton>
);

export const TextAndIcon: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <FavoriteIcon aria-hidden /> Toggle button
  </ToggleButton>
);

export const Sentiment: StoryFn<typeof ToggleButton> = (args) => (
  <FlowLayout>
    <ToggleButton sentiment="accented" {...args}>
      Accented
    </ToggleButton>
    <ToggleButton sentiment="positive" {...args}>
      Positive
    </ToggleButton>
    <ToggleButton sentiment="negative" {...args}>
      Negative
    </ToggleButton>
    <ToggleButton sentiment="caution" {...args}>
      Caution
    </ToggleButton>
  </FlowLayout>
);

export const Bordered: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton appearance="bordered" {...args}>
    <FavoriteIcon aria-hidden /> Bordered
  </ToggleButton>
);

export const Disabled: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <FavoriteIcon aria-hidden /> Disabled
  </ToggleButton>
);

Disabled.args = {
  disabled: true,
};
