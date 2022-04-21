import { Panel } from "@jpmorganchase/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./panel.qa.stories.css";

export default {
  title: "Lab/Panel/QA",
  component: Panel,
} as ComponentMeta<typeof Panel>;

export const CompareWithOriginalToolkit: ComponentStory<typeof Panel> = (
  props
) => {
  return (
    <QAContainer
      className="uitkPanelQA"
      imgSrc="/visual-regression-screenshots/Panel-vr-snapshot.png"
    >
      <AllRenderer>
        <Panel {...props}>
          <p>This is a panel around some text</p>
        </Panel>
      </AllRenderer>
    </QAContainer>
  );
};
