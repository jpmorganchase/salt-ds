import { ComponentMeta, Story } from "@storybook/react";
import { Panel } from "@jpmorganchase/uitk-core";
import { QAContainer, QAContainerProps } from "docs/components";

import "./panel.qa.stories.css";

export default {
  title: "Core/Panel/QA",
  component: Panel,
} as ComponentMeta<typeof Panel>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => (
  <QAContainer
    className="uitkPanelQA"
    cols={1}
    itemWidthAuto
    height={600}
    width={1000}
    {...props}
  >
    <Panel>
      <p>This is a panel around some text</p>
    </Panel>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <ExamplesGrid imgSrc="/visual-regression-screenshots/Panel-vr-snapshot.png" />
  );
};
