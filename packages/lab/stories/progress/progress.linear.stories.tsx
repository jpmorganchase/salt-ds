import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, Panel, SaltProvider } from "@salt-ds/core";
import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import { useProgressingValue } from "./useProgressingValue";

import "./progress.stories.css";

export default {
  title: "Lab/Progress/Linear",
  component: LinearProgress,
} as ComponentMeta<typeof LinearProgress>;

interface ProgressWithControlsProps {
  ProgressComponent: typeof CircularProgress | typeof LinearProgress;
}

const ProgressWithControls = ({
  ProgressComponent: Progress,
}: ProgressWithControlsProps) => {
  const { handleReset, handleStart, handleStop, isProgressing, value } =
    useProgressingValue();
  return (
    <div className="salt-ProgressWithControls-root">
      <div className="salt-ProgressWithControls-controls">
        <Button disabled={isProgressing} onClick={handleStart}>
          Start
        </Button>
        <Button disabled={!isProgressing} onClick={handleStop}>
          Stop
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <div className="salt-ProgressWithControls-progressComponentContainer">
        <Progress aria-label="Download" value={value} />
      </div>
    </div>
  );
};

const LinearExamples = () => (
  <Panel style={{ height: "unset", marginLeft: 20 }}>
    <div style={{ display: "flex" }}>
      <div>
        <h3>HD</h3>
        <SaltProvider density="high">
          <LinearProgress aria-label="Download" value={38} />
        </SaltProvider>
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>MD</h3>
        <SaltProvider density="medium">
          <LinearProgress aria-label="Download" value={38} />
        </SaltProvider>
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>LD</h3>
        <SaltProvider density="low">
          <LinearProgress aria-label="Download" value={38} />
        </SaltProvider>
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>TD</h3>
        <SaltProvider density="touch">
          <LinearProgress aria-label="Download" value={38} />
        </SaltProvider>
      </div>
    </div>
  </Panel>
);
export const All: ComponentStory<typeof LinearProgress> = () => (
  <div
    style={{
      height: "100%",
      overflowY: "scroll",
      position: "absolute",
      width: 1200,
      top: 0,
      left: 0,
      right: 0,
    }}
  >
    <SaltProvider mode="light">
      <LinearExamples />
    </SaltProvider>
    <SaltProvider mode="dark">
      <LinearExamples />
    </SaltProvider>
  </div>
);

export const Default: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress value={38} />
);

export const Disabled: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress disabled value={38} />
);

export const Indeterminate: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress value={38} variant="indeterminate" />
);

export const ProgressingValue: ComponentStory<typeof LinearProgress> = () => (
  <ProgressWithControls ProgressComponent={LinearProgress} />
);

export const LinearQuery: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress value={38} variant="query" />
);

export const MaxValue: ComponentStory<typeof CircularProgress> = () => (
  <div>
    <h3> max = 500, value = 250</h3>
    <LinearProgress aria-label="Download" value={250} max={500} />
  </div>
);

export const ShowNoInfo: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress showInfo={false} value={38} />
);

export const Unit: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress unit="px" value={38} />
);
