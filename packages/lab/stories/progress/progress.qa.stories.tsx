import { Meta, StoryFn } from "@storybook/react";

import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Progress/QA",
  component: CircularProgress,
} as Meta<typeof CircularProgress | typeof LinearProgress>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={3} {...props}>
      <LinearProgress className={className} value={38} />
      <CircularProgress aria-label="Download" value={38} />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
