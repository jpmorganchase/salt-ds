import { ToggleButton } from "@salt-ds/lab";
import { HomeIcon, FavoriteSolidIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Tooltip } from "@salt-ds/core";

export default {
  title: "Lab/Toggle Button",
  component: ToggleButton,
} as ComponentMeta<typeof ToggleButton>;

export const IconOnly: ComponentStory<typeof ToggleButton> = (args) => (
  <Tooltip content="Favorite">
    <ToggleButton aria-label="favorite" {...args}>
      <FavoriteSolidIcon />
    </ToggleButton>
  </Tooltip>
);

export const TextOnly: ComponentStory<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>AND</ToggleButton>
);

export const TextAndIcon: ComponentStory<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);

export const Disabled: ComponentStory<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);

Disabled.args = {
  disabled: true,
};
