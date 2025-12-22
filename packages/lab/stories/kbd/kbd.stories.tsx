import { StackLayout } from "@salt-ds/core";
import { Kbd, type KbdProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Kbd",
  component: Kbd,
};

export const Variants: StoryFn<KbdProps> = () => {
  return (
    <StackLayout style={{ width: "200px" }}>
      <Kbd>primary</Kbd>
      <Kbd variant="secondary">secondary</Kbd>
      <Kbd variant="tertiary">tertiary</Kbd>
    </StackLayout>
  );
};
