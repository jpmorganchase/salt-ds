import { Panel, Text } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Panel/Panel QA",
  component: Panel,
} as Meta<typeof Panel>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={3} itemPadding={4} height={600} width={1000} {...props}>
    <Panel>
      <Text as="p">This is a panel around some text</Text>
    </Panel>
    <Panel variant="secondary">
      <Text as="p">This is a secondary panel around some text</Text>
    </Panel>
    <Panel variant="tertiary">
      <Text as="p">This is a tertiary panel around some text</Text>
    </Panel>
    <Panel elevation="flat">
      <p>This is a panel with flat elevation</p>
    </Panel>
    <Panel elevation="raised">
      <p>This is a panel with raised elevation</p>
    </Panel>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
