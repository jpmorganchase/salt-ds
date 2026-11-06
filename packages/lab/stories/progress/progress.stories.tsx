import { Button, FlowLayout, StackLayout, Text } from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";
import { Progress } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useCallback, useEffect, useRef, useState } from "react";

export default {
  title: "Lab/Progress",
  component: Progress,
  // Show the indicator straight away. The Delay story shows the default delay.
  args: { delay: 0 },
} as Meta<typeof Progress>;

/** Runs a fake task: unknown size for `sizeUnknownFor` ms, then fills over `duration` ms. */
function useSimulatedTask({
  duration = 4000,
  sizeUnknownFor = 0,
}: {
  duration?: number;
  sizeUnknownFor?: number;
} = {}) {
  const [running, setRunning] = useState(false);
  const [value, setValue] = useState<number | undefined>(undefined);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  const start = () => {
    clear();
    setRunning(true);
    setValue(undefined);
    const steps = 20;
    for (let step = 0; step <= steps; step++) {
      timers.current.push(
        setTimeout(
          () => {
            setValue((step / steps) * 100);
            if (step === steps) setRunning(false);
          },
          sizeUnknownFor + (duration / steps) * step,
        ),
      );
    }
  };

  const reset = () => {
    clear();
    setRunning(false);
    setValue(undefined);
  };

  return { running, value, start, reset };
}

export const Default: StoryFn<typeof Progress> = (args) => (
  <div style={{ width: 400 }}>
    <Progress label="Uploading report.pdf" value={38} {...args} />
  </div>
);

export const Indeterminate: StoryFn<typeof Progress> = (args) => (
  <div style={{ width: 400 }}>
    <Progress label="Loading accounts" {...args} />
  </div>
);

export const Circular: StoryFn<typeof Progress> = (args) => (
  <StackLayout gap={3}>
    <FlowLayout gap={3} align="center">
      <Progress shape="circular" size="small" aria-label="Loading" {...args} />
      <Progress shape="circular" size="medium" aria-label="Loading" {...args} />
      <Progress shape="circular" size="large" aria-label="Loading" {...args} />
    </FlowLayout>
    <FlowLayout gap={3} align="center">
      <Progress
        shape="circular"
        size="small"
        value={38}
        aria-label="Uploading"
        {...args}
      />
      <Progress
        shape="circular"
        size="medium"
        value={38}
        label="Uploading"
        {...args}
      />
      <Progress
        shape="circular"
        size="large"
        value={38}
        aria-label="Uploading"
        {...args}
      />
    </FlowLayout>
  </StackLayout>
);

export const ValueText: StoryFn<typeof Progress> = (args) => (
  <StackLayout gap={3} style={{ width: 400 }}>
    <Progress
      label="Uploading files"
      value={3}
      max={5}
      getValueText={(value, max) => `${value} of ${max} files`}
      description="About 2 minutes left"
      {...args}
    />
    <Progress
      label="Downloading report.pdf"
      value={45}
      getValueText={(value, max) => `${value} of ${max} MB`}
      {...args}
    />
  </StackLayout>
);

export const States: StoryFn<typeof Progress> = (args) => (
  <StackLayout gap={3} style={{ width: 400 }}>
    <Progress label="Uploading report.pdf" value={60} paused {...args} />
    <Progress
      label="Uploading report.pdf"
      value={100}
      status="success"
      {...args}
    />
    <Progress
      label="Uploading report.pdf"
      value={60}
      status="error"
      description="The connection was lost. Try again."
      {...args}
    />
    <FlowLayout gap={3}>
      <Progress shape="circular" label="Paused" value={60} paused {...args} />
      <Progress shape="circular" label="Uploaded" status="success" {...args} />
      <Progress
        shape="circular"
        label="Failed"
        value={60}
        status="error"
        {...args}
      />
    </FlowLayout>
  </StackLayout>
);

/**
 * When a task's size isn't known yet, start indeterminate, then fill in place once it's known. The indicator keeps
 * its shape and position, so nothing moves.
 */
export const IndeterminateToDeterminate: StoryFn<typeof Progress> = (args) => {
  const { running, value, start, reset } = useSimulatedTask({
    sizeUnknownFor: 2000,
  });

  return (
    <StackLayout gap={3} style={{ width: 400 }}>
      <FlowLayout gap={1}>
        <Button onClick={start} disabled={running}>
          Start
        </Button>
        <Button onClick={reset}>Reset</Button>
      </FlowLayout>
      {(running || value !== undefined) && (
        <>
          <Progress
            label="Downloading report.pdf"
            value={value}
            status={value === 100 ? "success" : undefined}
            {...args}
          />
          <Progress
            shape="circular"
            size="large"
            aria-label="Downloading report.pdf"
            value={value}
            status={value === 100 ? "success" : undefined}
            {...args}
          />
        </>
      )}
    </StackLayout>
  );
};

/** Circular progress fits inside controls, such as a download button. */
export const InButton: StoryFn<typeof Progress> = (args) => {
  const { running, value, start } = useSimulatedTask({ sizeUnknownFor: 1500 });

  return (
    <FlowLayout gap={1}>
      <Button onClick={start} disabled={running} focusableWhenDisabled>
        {running ? (
          <Progress
            shape="circular"
            size="small"
            aria-label="Downloading"
            value={value}
            {...args}
          />
        ) : (
          <DownloadIcon aria-hidden />
        )}
        Download
      </Button>
    </FlowLayout>
  );
};

/** A page loader is a composition, not a component. */
export const PageLoader: StoryFn<typeof Progress> = (args) => (
  <StackLayout
    align="center"
    gap={3}
    style={{ height: 400, justifyContent: "center" }}
  >
    <Text styleAs="h2">My application</Text>
    <Progress
      shape="circular"
      size="large"
      label="Loading your accounts"
      {...args}
    />
  </StackLayout>
);

/**
 * By default, progress waits 1 second before it shows, so tasks that finish quickly show nothing.
 */
export const Delay: StoryFn<typeof Progress> = (args) => {
  const quick = useSimulatedTask({ duration: 600 });
  const slow = useSimulatedTask({ duration: 4000 });

  return (
    <StackLayout gap={3} style={{ width: 400 }}>
      <FlowLayout gap={1}>
        <Button onClick={quick.start}>Start a 0.6 second task</Button>
        <Button onClick={slow.start}>Start a 4 second task</Button>
      </FlowLayout>
      {quick.running && (
        <Progress label="Quick task" value={quick.value} {...args} />
      )}
      {slow.running && (
        <Progress label="Slow task" value={slow.value} {...args} />
      )}
    </StackLayout>
  );
};
Delay.args = { delay: 1000 };
