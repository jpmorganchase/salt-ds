import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, SaltProvider } from "@salt-ds/core";
import { CircularProgress, LinearProgress, Panel } from "@salt-ds/lab";
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
        <div className="salt-ProgressWithControls-container">
          <Progress aria-label="Download" size="small" value={value} />
          <h3>small</h3>
        </div>
        <div className="salt-ProgressWithControls-container">
          <Progress aria-label="Download" size="medium" value={value} />
          <h3>medium</h3>
        </div>
        <div className="salt-ProgressWithControls-container">
          <Progress aria-label="Download" size="large" value={value} />
          <h3>large</h3>
        </div>
      </div>
    </div>
  );
};


const LinearExamples = () => (
  <Panel style={{ height: "unset", marginLeft: 20 }}>
    <div style={{ display: "flex" }}>
      <div>
        <h3>size=small</h3>
        <LinearProgress aria-label="Download" size="small" value={38} />
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>size=medium</h3>
        <LinearProgress aria-label="Download" size="medium" value={38} />
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>size=large</h3>
        <LinearProgress aria-label="Download" size="large" value={38} />
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
  <div>
    <div>
      <h3>size=small</h3>
      <LinearProgress size="small" value={38} />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=medium</h3>
      <LinearProgress size="medium" value={38} />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=large</h3>
      <LinearProgress size="large" value={38} />
    </div>
  </div>
);

export const Disabled: ComponentStory<typeof LinearProgress> = () => (
  <div>
    <div>
      <h3>size=small</h3>
      <LinearProgress disabled size="small" value={38} />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=medium</h3>
      <LinearProgress disabled size="medium" value={38} />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=large</h3>
      <LinearProgress disabled size="large" value={38} />
    </div>
  </div>
);

export const Indeterminate: ComponentStory<
  typeof LinearProgress
> = () => (
  <div>
    <div>
      <h3>size=small</h3>
      <LinearProgress size="small" value={38} variant="indeterminate" />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=medium</h3>
      <LinearProgress size="medium" value={38} variant="indeterminate" />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=large</h3>
      <LinearProgress size="large" value={38} variant="indeterminate" />
    </div>
  </div>
);

export const ProgressingValue: ComponentStory<
  typeof LinearProgress
> = () => <ProgressWithControls ProgressComponent={LinearProgress} />;

export const LinearQuery: ComponentStory<typeof LinearProgress> = () => (
  <div>
    <div>
      <h3>size=small</h3>
      <LinearProgress size="small" value={38} variant="query" />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=medium</h3>
      <LinearProgress size="medium" value={38} variant="query" />
    </div>
    <div style={{ marginTop: 50 }}>
      <h3>size=large</h3>
      <LinearProgress size="large" value={38} variant="query" />
    </div>
  </div>
);

export const ShowNoInfo: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress showInfo={false} value={38} />
);

export const Unit: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress unit="px" value={38} />
);
