import { Meta, StoryFn } from "@storybook/react";
import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import { useProgressingValue } from "./useProgressingValue";

import "./progress.stories.css";

export default {
  title: "Lab/Progress/Linear",
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

export const Default: StoryFn<typeof LinearProgress> = (args) => (
  <LinearProgress aria-label="Download" {...args} />
);
Default.args = {
  value: 38,
};
export const HideLabel: StoryFn<typeof LinearProgress> = () => (
  <LinearProgress aria-label="Download" value={38} hideLabel />
);

export const ProgressingValue: StoryFn<typeof LinearProgress> = () => (
  <ProgressWithControls ProgressComponent={LinearProgress} />
);

export const MaxValue: StoryFn<typeof LinearProgress> = () => (
  <StackLayout>
    <h3 style={{ textAlign: "center" }}> max = 500, value = 250</h3>
    <LinearProgress aria-label="Download" value={250} max={500} />
  </StackLayout>
);
