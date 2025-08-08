import { Card, H1, Panel, Text } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Card/Card QA",
  component: Card,
} as Meta<typeof Card>;

export const AllExamplesUsingText: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  return (
    <QAContainer itemPadding={10} itemWidthAuto {...props}>
      <Card>
        <H1>Primary card</H1>
        <Text>Content</Text>
      </Card>
      <Card variant="secondary">
        <H1>Secondary card</H1>
        <Text>Content</Text>
      </Card>
      <Card variant="tertiary">
        <H1>Tertiary card</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="top">
        <H1>Accent top</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="right">
        <H1>Accent right</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="bottom">
        <H1>Accent bottom</H1>
        <Text>Content</Text>
      </Card>
      <Card accent="left">
        <H1>Accent left</H1>
        <Text>Content</Text>
      </Card>
      <Panel variant="tertiary">
        <Card variant="ghost">
          <H1>Ghost card</H1>
          <Text>Content</Text>
        </Card>
      </Panel>
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};
