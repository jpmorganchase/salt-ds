import { ComponentMeta, Story } from "@storybook/react";

import { CircularProgress, LinearProgress } from "@jpmorganchase/uitk-lab";
import { QAContainer } from "docs/components";

export default {
  title: "Lab/Progress/QA",
  component: CircularProgress,
} as ComponentMeta<typeof CircularProgress>;

export const AllExamplesGrid: Story = (props: {
  className?: string;
  imgSrc?: string;
}) => {
  return (
    <QAContainer cols={3} imgSrc={props.imgSrc}>
      <LinearProgress className={props.className} size="small" value={38} />
      <LinearProgress className={props.className} size="medium" value={38} />
      <LinearProgress className={props.className} size="large" value={38} />
      <LinearProgress
        className={props.className}
        disabled
        size="small"
        value={38}
      />
      <LinearProgress
        className={props.className}
        disabled
        size="medium"
        value={38}
      />
      <LinearProgress
        className={props.className}
        disabled
        size="large"
        value={38}
      />
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

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit = AllExamplesGrid.bind({});
CompareWithOriginalToolkit.args = {
  className: "backwardsCompat",
  imgSrc: "/visual-regression-screenshots/Progress-vr-snapshot.png",
};
