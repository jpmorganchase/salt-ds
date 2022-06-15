import { Card } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./card.qa.stories.css";

export default {
  title: "Core/Card/QA",
  component: Card,
} as ComponentMeta<typeof Card>;

export const AllExamplesGrid: ComponentStory<typeof Card> = () => {
  return (
    <AllRenderer className="uitkCardQA">
      <Card className="backwardsCompat">
        <div>
          <h1 style={{ margin: 0 }}>Card with density</h1>
          <span>Content</span>
        </div>
      </Card>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Card> = () => {
  return (
    <QAContainer
      width={600}
      height={636}
      className="uitkCardQA"
      imgSrc="/visual-regression-screenshots/Card-vr-snapshot.png"
    >
      <AllExamplesGrid />
    </QAContainer>
  );
};
