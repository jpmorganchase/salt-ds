import {
  Card,
  CardContent,
  H1,
  InteractableCard,
  Panel,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

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
      <Card>
        <CardContent>
          <H1>Accent left</H1>
          <Text>Content</Text>
        </CardContent>
      </Card>
      <Card>
        <Panel variant="secondary" style={{ height: 20 }} />
        <CardContent>
          <H1>Accent left</H1>
          <Text>Content</Text>
        </CardContent>
      </Card>
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection itemPadding={10} itemWidthAuto {...props}>
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
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
