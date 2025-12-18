import { StackLayout } from "@salt-ds/core";
import { Kbd, type KbdProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import React from "react";

export default {
  title: "Lab/Kbd",
  component: Kbd,
};

export const Variants: StoryFn<KbdProps> = () => {
  return (
    <StackLayout style={{ width: "200px" }}>
      <Kbd>Keyboard</Kbd>
      <Kbd variant="secondary">Keyboard</Kbd>
      <Kbd variant="tertiary">Keyboard</Kbd>
    </StackLayout>
  );
};
