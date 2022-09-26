import { Card } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { H1, Text } from "@jpmorganchase/uitk-lab";
import { QAContainer, QAContainerProps } from "docs/components";
import "./card.qa.stories.css";

export default {
  title: "Core/Card/QA",
  component: Card,
} as ComponentMeta<typeof Card>;

export const AllExamplesUsingText: Story<
  QAContainerProps & { className?: string }
> = (props) => {
  return (
    <QAContainer itemPadding={10} itemWidthAuto {...props}>
      <Card>
        <H1>Card with density</H1>
        <Text>Content</Text>
      </Card>
    </QAContainer>
  );
};
AllExamplesUsingText.parameters = {
  chromatic: { disableSnapshot: false },
};

export const AllExamplesOriginalContent: Story<
  QAContainerProps & { className?: string }
> = (props) => {
  const { className } = props;
  return (
    <QAContainer itemPadding={10} itemWidthAuto {...props}>
      <Card className={className}>
        <h1 style={{ margin: 0 }}>Card with density</h1>
        <span>Content</span>
      </Card>
    </QAContainer>
  );
};

AllExamplesOriginalContent.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesOriginalContent imgSrc="/visual-regression-screenshots/Card-vr-snapshot.png" />
  );
};
