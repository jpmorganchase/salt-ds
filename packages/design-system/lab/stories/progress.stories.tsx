import { FC } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button, Panel, ToolkitProvider } from "@jpmorganchase/uitk-core";
import { CircularProgress, LinearProgress } from "@jpmorganchase/uitk-lab";
import { useProgressingValue } from "./useProgressingValue";

import "./progress.stories.css";

export default {
  title: "Lab/Progress",
  component: LinearProgress,
} as ComponentMeta<typeof LinearProgress>;

interface ProgressWithControlsProps {
  ProgressComponent: typeof CircularProgress | typeof LinearProgress;
}

const ProgressWithControls: FC<ProgressWithControlsProps> = ({
  ProgressComponent: Progress,
}) => {
  const { handleReset, handleStart, handleStop, isProgressing, value } =
    useProgressingValue();
  return (
    <div className="uitk-ProgressWithControls-root">
      <div className="uitk-ProgressWithControls-controls">
        <Button disabled={isProgressing} onClick={handleStart}>
          Start
        </Button>
        <Button disabled={!isProgressing} onClick={handleStop}>
          Stop
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <div className="uitk-ProgressWithControls-progressComponentContainer">
        <div className="uitk-ProgressWithControls-container">
          <Progress aria-label="Download" size="small" value={value} />
          <h3>small</h3>
        </div>
        <div className="uitk-ProgressWithControls-container">
          <Progress aria-label="Download" size="medium" value={value} />
          <h3>medium</h3>
        </div>
        <div className="uitk-ProgressWithControls-container">
          <Progress aria-label="Download" size="large" value={value} />
          <h3>large</h3>
        </div>
      </div>
    </div>
  );
};

const CircularExamples = () => (
  <Panel style={{ height: "unset", marginLeft: 20 }}>
    <div style={{ display: "flex" }}>
      <div>
        <h3>size=small</h3>
        <CircularProgress aria-label="Download" size="small" value={38} />
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>size=medium</h3>
        <CircularProgress aria-label="Download" size="medium" value={38} />
      </div>
      <div style={{ marginLeft: 100 }}>
        <h3>size=large</h3>
        <CircularProgress aria-label="Download" size="large" value={38} />
      </div>
    </div>
  </Panel>
);

export const CircularAll: ComponentStory<typeof CircularProgress> = () => (
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
    <ToolkitProvider theme="light">
      <CircularExamples />
    </ToolkitProvider>
    <ToolkitProvider theme="dark">
      <CircularExamples />
    </ToolkitProvider>
  </div>
);

export const CircularDefault: ComponentStory<typeof CircularProgress> = () => (
  <div style={{ display: "flex" }}>
    <div>
      <h3>size=small</h3>
      <CircularProgress aria-label="Download" size="small" value={100} />
    </div>
    <div style={{ marginLeft: 100 }}>
      <h3>size=medium</h3>
      <CircularProgress aria-label="Download" size="medium" value={38} />
    </div>
    <div style={{ marginLeft: 100 }}>
      <h3>size=large</h3>
      <CircularProgress aria-label="Download" size="large" value={38} />
    </div>
  </div>
);

export const CircularDisabled: ComponentStory<typeof CircularProgress> = () => (
  <div style={{ display: "flex" }}>
    <div>
      <h3>size=small</h3>
      <CircularProgress
        aria-label="Download"
        disabled
        size="small"
        value={38}
      />
    </div>
    <div style={{ marginLeft: 100 }}>
      <h3>size=medium</h3>
      <CircularProgress
        aria-label="Download"
        disabled
        size="medium"
        value={38}
      />
    </div>
    <div style={{ marginLeft: 100 }}>
      <h3>size=large</h3>
      <CircularProgress
        aria-label="Download"
        disabled
        size="large"
        value={38}
      />
    </div>
  </div>
);

export const CircularIndeterminate: ComponentStory<
  typeof CircularProgress
> = () => (
  <div style={{ display: "flex" }}>
    <div>
      <h3>size=small</h3>
      <CircularProgress
        aria-label="Download"
        showInfo={false}
        size="small"
        variant="indeterminate"
      />
    </div>
    <div style={{ marginLeft: 100 }}>
      <h3>size=medium</h3>
      <CircularProgress
        aria-label="Download"
        showInfo={false}
        size="medium"
        variant="indeterminate"
      />
    </div>
    <div style={{ marginLeft: 100 }}>
      <h3>size=large</h3>
      <CircularProgress
        aria-label="Download"
        showInfo={false}
        size="large"
        variant="indeterminate"
      />
    </div>
  </div>
);

export const CircularProgressingValue: ComponentStory<
  typeof CircularProgress
> = () => <ProgressWithControls ProgressComponent={CircularProgress} />;

export const CircularShowNoInfo: ComponentStory<
  typeof CircularProgress
> = () => (
  <CircularProgress aria-label="Download" showInfo={false} value={38} />
);

export const CircularUnit: ComponentStory<typeof CircularProgress> = () => (
  <CircularProgress aria-label="Download" unit="px" value={38} />
);

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

export const LinearAll: ComponentStory<typeof LinearProgress> = () => (
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
    <ToolkitProvider theme="light">
      <LinearExamples />
    </ToolkitProvider>
    <ToolkitProvider theme="dark">
      <LinearExamples />
    </ToolkitProvider>
  </div>
);

export const LinearCustomStyles: ComponentStory<typeof LinearProgress> = () => {
  return (
    <>
      <div style={{ padding: "5px 0 5px 0" }}>
        <LinearProgress
          className="uitk-LinearCustomStyles-styles1"
          value={20}
        />
      </div>
      <div style={{ padding: "5px 0 5px 0" }}>
        <LinearProgress
          className="uitk-LinearCustomStyles-styles2"
          value={30}
        />
      </div>
      <div style={{ padding: "5px 0 5px 0" }}>
        <LinearProgress
          className="uitk-LinearCustomStyles-styles3"
          value={60}
        />
      </div>
    </>
  );
};

export const LinearDefault: ComponentStory<typeof LinearProgress> = () => (
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

export const LinearDisabled: ComponentStory<typeof LinearProgress> = () => (
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

export const LinearIndeterminate: ComponentStory<
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

export const LinearProgressingValue: ComponentStory<
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

export const LinearShowNoInfo: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress showInfo={false} value={38} />
);

export const LinearUnit: ComponentStory<typeof LinearProgress> = () => (
  <LinearProgress unit="px" value={38} />
);
