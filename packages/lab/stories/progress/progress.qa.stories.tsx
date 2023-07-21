import { ComponentMeta, Story } from "@storybook/react";

import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Progress/QA",
  component: CircularProgress,
} as ComponentMeta<typeof CircularProgress | typeof LinearProgress>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={3} {...props}>
      <LinearProgress className={className} value={38} />
      <LinearProgress className={className} disabled value={38} />
      <CircularProgress aria-label="Download" value={38} />
      <CircularProgress aria-label="Download" disabled value={38} />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
