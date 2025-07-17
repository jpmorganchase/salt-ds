import { CircularProgress, LinearProgress } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

import "./progress.qa.stories.css";

export default {
  title: "Core/Progress/Progress QA",
  component: CircularProgress,
} as Meta<typeof CircularProgress | typeof LinearProgress>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={2} {...props}>
      <LinearProgress
        aria-label="Download"
        className={className}
        value={38}
        style={{ padding: "50px" }}
      />
      <CircularProgress aria-label="Download" value={38} />
      <LinearProgress
        aria-label="Download"
        className={className}
        value={38}
        bufferValue={60}
        style={{ padding: "50px" }}
      />
      <CircularProgress aria-label="Download" value={38} bufferValue={60} />
      <LinearProgress
        aria-label="Download"
        className={className}
        value={38}
        style={{ padding: "50px" }}
        hideLabel
      />
      <CircularProgress aria-label="Download" value={38} hideLabel />
      <LinearProgress
        aria-label="Download"
        // Chromatic doesn't work https://www.chromatic.com/docs/animations/#css-animations
        className="noAnimation"
        style={{ padding: "50px" }}
      />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
