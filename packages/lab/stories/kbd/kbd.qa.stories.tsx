import { Kbd } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import React from "react";

export default {
  title: "Lab/Kbd/QA",
  component: Kbd,
} as Meta<typeof Kbd>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} height={950} itemPadding={5}>
    <Kbd>Key</Kbd>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
