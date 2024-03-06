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
  title: "Core/Progress/Circular",
  component: CircularProgress,
} as Meta<typeof CircularProgress>;

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

export const Default: StoryFn<typeof CircularProgress> = (args) => (
  <CircularProgress aria-label="Download" {...args} />
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

export const MaxValue: StoryFn<typeof CircularProgress> = () => (
  <StackLayout align="center">
    <h3> max = 500, value = 250</h3>
    <CircularProgress aria-label="Download" value={250} max={500} />
  </StackLayout>
);

export const ProgressingValue: StoryFn<typeof CircularProgress> = () => (
  <ProgressWithControls ProgressComponent={CircularProgress} />
);
