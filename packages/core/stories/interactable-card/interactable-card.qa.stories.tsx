import {
  H1,
  InteractableCard,
  InteractableCardGroup,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

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
      <InteractableCard disabled>
        <H1>Disabled primary</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard disabled variant="secondary">
        <H1>Disabled secondary</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard disabled variant="tertiary">
        <H1>Disabled tertiary</H1>
        <Text>Content</Text>
      </InteractableCard>
    </QAContainer>
  );
};
AllExamples.parameters = {
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
