import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel } from "@jpmorganchase/uitk-core";
import { AllRenderer, QAContainer } from "docs/components";

import "./panel.qa.stories.css";

export default {
  title: "Core/Panel/QA",
  component: Panel,
} as ComponentMeta<typeof Panel>;

export const ExamplesGrid: ComponentStory<typeof Panel> = (props) => {
  return (
    <AllRenderer>
      <Panel {...props}>
        <p>This is a panel around some text</p>
      </Panel>
    </AllRenderer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Panel> = (
  props
) => {
  return (
    <QAContainer
      className="uitkPanelQA"
      imgSrc="/visual-regression-screenshots/Panel-vr-snapshot.png"
    >
      <ExamplesGrid />
    </QAContainer>
  );
};
