import { Panel } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Panel/Panel QA",
  component: Panel,
} as Meta<typeof Panel>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={3} itemPadding={4} height={600} width={1000} {...props}>
    <Panel>
      <p>This is a panel around some text</p>
    </Panel>
    <Panel variant="secondary">
      <p>This is a secondary panel around some text</p>
    </Panel>
    <Panel variant="tertiary">
      <p>This is a tertiary panel around some text</p>
    </Panel>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};
