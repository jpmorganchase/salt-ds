import {
  Card,
  FlowLayout,
  GridLayout,
  H1,
  InteractableCard,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Card/Card QA",
  component: Card,
} as Meta<typeof Card>;

const AllExamples = () => (
  <FlowLayout>
    <Card>
      <H1>Card with density</H1>
      <Text>Content</Text>
    </Card>
    <Card variant="secondary">
      <H1>Secondary card with density</H1>
      <Text>Content</Text>
    </Card>
    <Card size="small">
      <H1>Small card with density</H1>
      <Text>Content</Text>
    </Card>
    <Card size="medium">
      <H1>Medium card with density</H1>
      <Text>Content</Text>
    </Card>
    <InteractableCard>
      <H1>Interactable card with density</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCard disabled>
      <H1>Disabled interactable card with density</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCard variant="secondary">
      <H1>Secondary interactable card with density</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCard size="small">
      <H1>Small interactable card with density</H1>
      <Text>Content</Text>
    </InteractableCard>
    <InteractableCard size="medium">
      <H1>Medium interactable card with density</H1>
      <Text>Content</Text>
    </InteractableCard>
  </FlowLayout>
);

export const AllExamplesUsingText: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  return (
    <QAContainer itemPadding={10} itemWidthAuto {...props}>
      <AllExamples />
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection itemPadding={10} itemWidthAuto {...props}>
    <AllExamples />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
