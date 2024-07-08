import { Panel } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Panel/Panel QA",
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

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection
    cols={1}
    itemWidthAuto
    height={600}
    width={1000}
    {...props}
  >
    <Panel>
      <p>This is a panel around some text</p>
    </Panel>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
