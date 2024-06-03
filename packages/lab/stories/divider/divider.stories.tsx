import { StoryFn } from "@storybook/react";
import { StackLayout } from "@salt-ds/core";

import { Divider, DividerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Divider",
  component: Divider,
};

export const Variants: StoryFn<DividerProps> = () => {
  return (
    <StackLayout gap={6} style={{ width: "200px" }}>
      <Divider />
      <Divider variant="secondary" />
      <Divider variant="tertiary" />
    </StackLayout>
  );
};

export const Vertical: StoryFn<DividerProps> = () => {
  return (
    <StackLayout direction="row" gap={10} style={{ height: "200px" }}>
      <Divider orientation="vertical" />
      <Divider orientation="vertical" variant="secondary" />
      <Divider orientation="vertical" variant="tertiary" />
    </StackLayout>
  );
};
