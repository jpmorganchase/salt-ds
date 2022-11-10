import { ComponentMeta, Story } from "@storybook/react";

import { CircularProgress, LinearProgress } from "@jpmorganchase/uitk-lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Progress/QA",
  component: CircularProgress,
} as ComponentMeta<typeof CircularProgress | typeof LinearProgress>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={3} {...props}>
      <LinearProgress className={className} size="small" value={38} />
      <LinearProgress className={className} size="medium" value={38} />
      <LinearProgress className={className} size="large" value={38} />
      <LinearProgress className={className} disabled size="small" value={38} />
      <LinearProgress className={className} disabled size="medium" value={38} />
      <LinearProgress className={className} disabled size="large" value={38} />
      <CircularProgress aria-label="Download" size="small" value={38} />
      <CircularProgress aria-label="Download" size="medium" value={38} />
      <CircularProgress aria-label="Download" size="large" value={38} />
      <CircularProgress
        aria-label="Download"
        disabled
        size="small"
        value={38}
      />
      <CircularProgress
        aria-label="Download"
        disabled
        size="medium"
        value={38}
      />
      <CircularProgress
        aria-label="Download"
        disabled
        size="large"
        value={38}
      />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
