import { Kbd } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Kbd/QA",
  component: Kbd,
} as Meta<typeof Kbd>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} height={950} itemPadding={5}>
    <Kbd>Keyboard</Kbd>
    <Kbd variant="secondary">Keyboard</Kbd>
    <Kbd variant="tertiary">Keyboard</Kbd>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
