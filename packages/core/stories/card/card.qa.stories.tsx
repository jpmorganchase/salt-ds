import { Card } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Card/Card QA",
  component: Card,
} as Meta<typeof Card>;

export const AllExamplesUsingText: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  return <QAContainer itemPadding={10} itemWidthAuto {...props} />;
};
AllExamplesUsingText.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
