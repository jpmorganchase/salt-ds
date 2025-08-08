import { StatusIndicator } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Status Indicator/Status Indicator QA",
  component: StatusIndicator,
} as Meta<typeof StatusIndicator>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={4} {...props}>
    <StatusIndicator status="info" />
    <StatusIndicator status="warning" />
    <StatusIndicator status="error" />
    <StatusIndicator status="success" />

    <StatusIndicator status="info" size={1} />
    <StatusIndicator status="warning" size={2} />
    <StatusIndicator status="error" size={3} />
    <StatusIndicator status="success" size={4} />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
