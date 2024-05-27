import { StoryFn } from "@storybook/react";
import { Text, StackLayout } from "@salt-ds/core";

import { Divider, DividerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Divider",
  component: Divider,
};

export const Primary: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Text>About</Text>
      <Divider />
      <Text>Patterns</Text>
    </StackLayout>
  );
};

export const Secondary: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Text>About</Text>
      <Divider variant="secondary" />
      <Text>Patterns</Text>
    </StackLayout>
  );
};

export const Tertiary: StoryFn<DividerProps> = () => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Text>About</Text>
      <Divider variant="tertiary" />
      <Text>Patterns</Text>
    </StackLayout>
  );
};

export const Vertical: StoryFn<DividerProps> = () => {
  return (
    <StackLayout direction="row">
      <Text>About</Text>
      <Divider orientation="vertical" />
      <Text>Patterns</Text>
      <Divider orientation="vertical" />
      <Text>Foundation</Text>
      <Divider orientation="vertical" />
      <Text>Theming</Text>
    </StackLayout>
  );
};
