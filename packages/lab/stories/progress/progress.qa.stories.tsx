import { Progress } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Progress/Progress QA",
  component: Progress,
} as Meta<typeof Progress>;

const getFiles = (value: number, max: number) => `${value} of ${max} files`;

export const AllStates: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={2} itemPadding={12} {...props}>
    <div style={{ width: 300 }}>
      <Progress delay={0} label="Uploading files" value={0} />
    </div>
    <div style={{ width: 300 }}>
      <Progress
        delay={0}
        label="Uploading files"
        value={3}
        max={5}
        getValueText={getFiles}
        description="About 2 minutes left"
      />
    </div>
    <div style={{ width: 300 }}>
      <Progress delay={0} label="Playing video" value={38} bufferValue={60} />
    </div>
    <div style={{ width: 300 }}>
      <Progress delay={0} label="Loading accounts" />
    </div>
    <div style={{ width: 300 }}>
      <Progress delay={0} aria-label="Loading accounts" />
    </div>
    <div style={{ width: 300 }}>
      <Progress delay={0} label="Uploading files" value={60} paused />
    </div>
    <div style={{ width: 300 }}>
      <Progress delay={0} label="Uploading files" status="success" />
    </div>
    <div style={{ width: 300 }}>
      <Progress
        delay={0}
        label="Uploading files"
        value={60}
        status="error"
        description="The connection was lost. Try again."
      />
    </div>
    <div style={{ width: 300 }}>
      <Progress
        delay={0}
        label="A long label that wraps onto more than one line in a narrow container"
        value={38}
      />
    </div>
    <Progress delay={0} shape="circular" size="small" aria-label="Loading" />
    <Progress
      delay={0}
      shape="circular"
      size="small"
      value={38}
      aria-label="Uploading"
    />
    <Progress delay={0} shape="circular" label="Loading accounts" />
    <Progress delay={0} shape="circular" label="Uploading" value={38} />
    <Progress delay={0} shape="circular" size="large" aria-label="Loading" />
    <Progress
      delay={0}
      shape="circular"
      size="large"
      value={38}
      aria-label="Uploading"
    />
    <Progress delay={0} shape="circular" label="Paused" value={60} paused />
    <Progress delay={0} shape="circular" label="Uploaded" status="success" />
    <Progress
      delay={0}
      shape="circular"
      label="Failed"
      value={60}
      status="error"
    />
    <Progress
      delay={0}
      shape="circular"
      size="large"
      aria-label="Uploading"
      value={100}
      status="success"
    />
  </QAContainer>
);

AllStates.parameters = {
  chromatic: { disableSnapshot: false },
};
