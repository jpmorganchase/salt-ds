import { Meta, StoryFn } from "@storybook/react";
import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import { useProgressingValue } from "./useProgressingValue";

import "./progress.stories.css";

export default {
  title: "Lab/Progress/Circular",
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
      <FlowLayout gap={1} className="controls">
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

export const Default: StoryFn<typeof CircularProgress> = () => (
  <CircularProgress aria-label="Download" value={38} />
);

export const MaxValue: StoryFn<typeof CircularProgress> = () => (
  <StackLayout align="center">
    <h3> max = 500, value = 250</h3>
    <CircularProgress aria-label="Download" value={250} max={500} />
  </StackLayout>
);

export const ProgressingValue: StoryFn<typeof CircularProgress> = () => (
  <ProgressWithControls ProgressComponent={CircularProgress} />
);

export const ShowNoInfo: StoryFn<typeof CircularProgress> = () => (
  <CircularProgress aria-label="Download" showInfo={false} value={38} />
);
