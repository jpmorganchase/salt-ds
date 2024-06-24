import { useState, useEffect } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  Button,
  FlowLayout,
  StackLayout,
  CircularProgress,
  LinearProgress,
  ValidationStatus,
  Toast,
  ToastContent,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
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

export const Indeterminate = Default.bind({});

export const IndeterminateToDeterminate: StoryFn<
  typeof LinearProgress
> = () => {
  const [value, setValue] = useState<number | undefined>(undefined);

  const [toastStatus, setToastStatus] = useState<{
    header: string;
    status: ValidationStatus;
    message: string;
  }>({
    header: "File uploading",
    status: "info",
    message: "File upload to shared drive in progress.",
  });

  useEffect(() => {
    const timer = setTimeout(() => setValue(0), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (value !== undefined && value < 100) {
      const interval = setInterval(
        () => setValue((currentValue) => (currentValue ?? 0) + 1),
        20
      );
      return () => clearInterval(interval);
    }
  }, [value]);

  useEffect(() => {
    if (value === 100) {
      setToastStatus({
        header: "Upload complete",
        status: "success",
        message: "File has successfully been uploaded to shared drive.",
      });
    }
  }, [value]);

  return (
    <Toast status={toastStatus.status}>
      <ToastContent>
        <div>
          <Text>
            <strong>{toastStatus.header}</strong>
          </Text>
          <div>{toastStatus.message}</div>
          {value !== 100 && (
            <LinearProgress aria-label="Download" value={value} />
          )}
        </div>
      </ToastContent>
      <Button variant="secondary" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
  );
};
