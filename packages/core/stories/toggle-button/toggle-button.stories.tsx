import {
  FlowLayout,
  ToggleButton,
  type ToggleButtonProps,
  Tooltip,
} from "@salt-ds/core";
import { FavoriteIcon, HomeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

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

export const Controlled: StoryFn<typeof ToggleButton> = (args) => {
  const [toggled, setToggled] = useState(true);
  const handleToggle: ToggleButtonProps["onChange"] = (event) => {
    setToggled((old) => !old);
    args.onChange?.(event);
  };
  return (
    <ToggleButton
      {...args}
      onChange={handleToggle}
      selected={toggled}
      value="home"
    >
      <HomeIcon aria-hidden />
      Home
    </ToggleButton>
  );
};

export const Disabled: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton {...args}>
    <FavoriteIcon aria-hidden /> Disabled
  </ToggleButton>
);
Disabled.args = {
  disabled: true,
};

export const DefaultSelected: StoryFn<typeof ToggleButton> = (args) => (
  <ToggleButton defaultSelected {...args}>
    Toggle Button
  </ToggleButton>
);
