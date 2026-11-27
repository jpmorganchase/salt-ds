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
      <Progress delay={0} label="Uploading files" value={60} status="paused" />
    </div>
    <div style={{ width: 300 }}>
      <Progress
        label="Processing files"
        value={100}
        status="active"
        description="Upload complete. Processing is still in progress."
      />
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
    <Progress
      delay={0}
      shape="circular"
      label="Uploading"
      value={60}
      status="paused"
    />
    <Progress
      shape="circular"
      label="Processing files"
      value={100}
      status="active"
    />
    <Progress delay={0} shape="circular" label="Uploading" status="success" />
    <Progress
      delay={0}
      shape="circular"
      label="Uploading"
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
    <Progress
      delay={0}
      shape="circular"
      size="large"
      label="Loading your accounts"
    />
    <Progress
      delay={0}
      shape="circular"
      size="large"
      label="Uploading"
      value={38}
      description="About 2 minutes left"
    />
  </QAContainer>
);

AllStates.parameters = {
  chromatic: { disableSnapshot: false },
};
