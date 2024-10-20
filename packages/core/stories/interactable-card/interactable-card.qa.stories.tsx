import {
  H1,
  InteractableCard,
  InteractableCardGroup,
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
  title: "Core/Interactable Card/Interactable Card QA",
  component: InteractableCard,
} as Meta<typeof InteractableCard>;

export const AllExamples: StoryFn<QAContainerProps & { className?: string }> = (
  props,
) => {
  return (
    <QAContainer itemPadding={4} cols={4} itemWidthAuto {...props}>
      <InteractableCard>
        <H1>Primary card</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard variant="secondary">
        <H1>Secondary card</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard variant="tertiary">
        <H1>Tertiary card</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCardGroup
        defaultValue={["top", "right", "bottom", "left"]}
        multiSelect
      >
        <InteractableCard accent="top" value="top">
          <H1>Accent top</H1>
          <Text>Content</Text>
        </InteractableCard>
        <InteractableCard accent="right" value="right">
          <H1>Accent right</H1>
          <Text>Content</Text>
        </InteractableCard>
        <InteractableCard accent="bottom" value="bottom">
          <H1>Accent bottom</H1>
          <Text>Content</Text>
        </InteractableCard>
        <InteractableCard accent="left" value="left">
          <H1>Accent left</H1>
          <Text>Content</Text>
        </InteractableCard>
      </InteractableCardGroup>
    </QAContainer>
  );
};
AllExamples.parameters = {
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
  <QAContainerNoStyleInjection
    itemPadding={4}
    cols={4}
    itemWidthAuto
    {...props}
  >
    <InteractableCard>
      <H1>Primary card</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCard variant="secondary">
      <H1>Secondary card</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCard variant="tertiary">
      <H1>Tertiary card</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCardGroup
      defaultValue={["top", "right", "bottom", "left"]}
      multiSelect
    >
      <InteractableCard accent="top">
        <H1>Accent top</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard accent="right">
        <H1>Accent right</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard accent="bottom">
        <H1>Accent bottom</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard accent="left">
        <H1>Accent left</H1>
        <Text>Content</Text>
      </InteractableCard>
    </InteractableCardGroup>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
