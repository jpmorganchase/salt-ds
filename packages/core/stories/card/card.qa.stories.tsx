import { Card, H1, InteractableCard, Text } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

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
        <H1>Card with density</H1>
        <Text>Content</Text>
      </Card>
      <Card variant="secondary">
        <H1>Secondary card with density</H1>
        <Text>Content</Text>
      </Card>
      <InteractableCard>
        <H1>Interctable card with density</H1>
        <Text>Content</Text>
      </InteractableCard>
      <InteractableCard variant="secondary">
        <H1>Secondary interctable with density</H1>
        <Text>Content</Text>
      </InteractableCard>
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: { disableSnapshot: false },
};
