import { Meta, StoryFn } from "@storybook/react";
import { Panel } from "@salt-ds/core";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Panel/QA",
  component: Panel,
} as Meta<typeof Panel>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemWidthAuto height={600} width={1000} {...props}>
    <Panel>
      <p>This is a panel around some text</p>
    </Panel>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
