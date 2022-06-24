import { Card } from "@jpmorganchase/uitk-core";
import { H1, Text } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./card.qa.stories.css";

export default {
  title: "Core/Card/QA",
  component: Card,
} as ComponentMeta<typeof Card>;

export const AllExamplesGrid: ComponentStory<typeof Card> = (props) => {
  const { className } = props;
  return (
    <AllRenderer className="uitkCardQA">
      <Card className={className}>
        <H1>Card with density</H1>
        <Text>Content</Text>
      </Card>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid: ComponentStory<typeof Card> = () => {
  return (
    <AllRenderer className="uitkCardQA">
      <Card className={"backwardsCompat"}>
        <div>
          <h1 style={{ margin: 0 }}>Card with density</h1>
          <span>Content</span>
        </div>
      </Card>
    </AllRenderer>
  );
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Card> = () => {
  return (
    <QAContainer
      width={600}
      height={636}
      className="uitkCardQA"
      imgSrc="/visual-regression-screenshots/Card-vr-snapshot.png"
    >
      <BackwardsCompatGrid />
    </QAContainer>
  );
};
