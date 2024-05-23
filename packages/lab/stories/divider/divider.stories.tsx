import { StoryFn } from "@storybook/react";
import { StackLayout } from "@salt-ds/core";

import { Divider, DividerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Divider",
  component: Divider,
};

export const Default: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Divider />
    </StackLayout>
  );
};

export const Secondary: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Divider variant="secondary" />
    </StackLayout>
  );
};

export const Tertiary: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Divider variant="tertiary" />
    </StackLayout>
  );
};

export const Vertical: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Divider orientation="vertical" />
    </StackLayout>
  );
};
