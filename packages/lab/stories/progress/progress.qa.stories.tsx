import { Meta, StoryFn } from "@storybook/react";

import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Progress/Progress QA",
  component: CircularProgress,
} as Meta<typeof CircularProgress | typeof LinearProgress>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={2} {...props}>
      <LinearProgress
        className={className}
        value={38}
        style={{ padding: "50px" }}
      />
      <CircularProgress aria-label="Download" value={38} />
      <LinearProgress
        className={className}
        value={38}
        style={{ padding: "50px" }}
        hideLabel
      />
      <CircularProgress aria-label="Download" value={38} hideLabel />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
