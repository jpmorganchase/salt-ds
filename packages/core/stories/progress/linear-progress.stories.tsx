import { Meta, StoryFn } from "@storybook/react";
import {
  Button,
  FlowLayout,
  StackLayout,
  CircularProgress,
  LinearProgress,
} from "@salt-ds/core";
import { useProgressingValue } from "./useProgressingValue";

import "./progress.stories.css";

export default {
  title: "Core/Progress/Linear",
  component: LinearProgress,
} as Meta<typeof LinearProgress>;

interface ProgressWithControlsProps {
  ProgressComponent: typeof CircularProgress | typeof LinearProgress;
}

const ProgressWithControls = ({
  ProgressComponent: Progress,
}: ProgressWithControlsProps) => {
  const { handleReset, handleStart, handleStop, isProgressing, value } =
    useProgressingValue();
  return (
    <div className="root">
      <FlowLayout className="controls" gap={1}>
        <Button disabled={isProgressing} onClick={handleStart}>
          Start
        </Button>
        <Button disabled={!isProgressing} onClick={handleStop}>
          Stop
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </FlowLayout>
      <Progress aria-label="Download" value={value} />
    </div>
  );
};
const ProgressBufferWithControls = ({
  ProgressComponent: Progress,
}: ProgressWithControlsProps) => {
  const { handleReset, handleStart, handleStop, isProgressing, value } =
    useProgressingValue();
  return (
    <div className="root">
      <FlowLayout className="controls" gap={1}>
        <Button disabled={isProgressing} onClick={handleStart}>
          Start
        </Button>
        <Button disabled={!isProgressing} onClick={handleStop}>
          Stop
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </FlowLayout>
      <Progress aria-label="Download" bufferValue={value} />
    </div>
  );
};

export const Default: StoryFn<typeof LinearProgress> = (args) => (
  <LinearProgress aria-label="Download" {...args} />
);
Default.args = {
  value: 38,
};
export const HideLabel = Default.bind({});
HideLabel.args = {
  hideLabel: true,
  value: 38,
};
export const WithBuffer = Default.bind({});
WithBuffer.args = {
  value: 38,
  bufferValue: 60,
};

export const MaxValue: StoryFn<typeof LinearProgress> = () => (
  <StackLayout>
    <h3 style={{ textAlign: "center" }}> max = 500, value = 250</h3>
    <LinearProgress aria-label="Download" value={250} max={500} />
  </StackLayout>
);

export const ProgressingValue: StoryFn<typeof LinearProgress> = () => (
  <ProgressWithControls ProgressComponent={LinearProgress} />
);

export const ProgressingBufferValue: StoryFn<typeof LinearProgress> = () => (
  <ProgressBufferWithControls ProgressComponent={LinearProgress} />
);

// export const Indeterminate = Default.bind({});
// Indeterminate.args = {
//   variant: "indeterminate",
// };

// TODO: temp example to be removed
export const Indeterminate: StoryFn<typeof LinearProgress> = () => (
  <StackLayout direction="row" gap={10}>
    <StackLayout>
      <h3 style={{ textAlign: "center" }}> Animation speed = 2s</h3>
      <LinearProgress variant="indeterminate" />
      <div></div>
      <h3 style={{ textAlign: "center" }}> Animation speed = 1s</h3>
      <LinearProgress variant="indeterminate" animationSpeed="1s" />
    </StackLayout>
    <StackLayout>
      <h3 style={{ textAlign: "center" }}> Progress line width = 60%</h3>
      <LinearProgress variant="indeterminate" />
      <div></div>
      <h3 style={{ textAlign: "center" }}> Progress line width = 33%</h3>
      <LinearProgress variant="indeterminate" progressLineWidth={33} />
    </StackLayout>
    <StackLayout>
      <h3 style={{ textAlign: "center" }}>
        Progress line width = 66% Animation speed = 1.8s Ease In/ Ease Out
      </h3>
      <LinearProgress
        variant="indeterminate"
        progressLineWidth={66}
        animationSpeed="1.8s"
        animationTiming="ease-in-out"
      />
    </StackLayout>
  </StackLayout>
);
