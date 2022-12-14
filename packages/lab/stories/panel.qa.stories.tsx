import { ComponentMeta, Story } from "@storybook/react";
import { Panel } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Panel/QA",
  component: Panel,
} as ComponentMeta<typeof Panel>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemWidthAuto height={600} width={1000} {...props}>
    <Panel>
      <p>This is a panel around some text</p>
    </Panel>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
