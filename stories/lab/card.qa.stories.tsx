import { Card } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "../components";
import "./card.qa.stories.css";

export default {
  title: "Lab/Card/QA",
  component: Card,
} as ComponentMeta<typeof Card>;

export const CompareWithOriginalToolkit: ComponentStory<typeof Card> = () => {
  return (
    <QAContainer
      className="uitkCardQA"
      imgSrc="/visual-regression-screenshots/Card-vr-snapshot.png"
    >
      <AllRenderer>
        <Card>
          <div>
            <h1 style={{ margin: 0 }}>Card with density</h1>
            <span>Content</span>
          </div>
        </Card>
      </AllRenderer>
    </QAContainer>
  );
};
