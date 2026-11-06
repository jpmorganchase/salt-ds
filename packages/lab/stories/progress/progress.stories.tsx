import {
  Button,
  type ButtonProps,
  FlowLayout,
  StackLayout,
  Text,
  ToggleButton,
} from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";
import { Progress, type ProgressProps } from "@salt-ds/lab";
import type { ArgTypes, Meta, StoryFn } from "@storybook/react-vite";
import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import "./progress.stories.css";

export default {
  title: "Lab/Progress",
  component: Progress,
  // Show the indicator straight away. The Delay story shows the default delay.
  args: { delay: 0 },
} as Meta<typeof Progress>;

// The stories only pass `delay`, so circular and linear examples can share the same args.
type StoryArgs = Pick<ProgressProps, "delay">;

// Prototype: the buffer is stripes in the bar color, or try a tint or dots. See progress.stories.css.
const bufferFills = {
  stripes: undefined,
  tint: "progressBufferTint",
  dots: "progressBufferDots",
};

type BufferFillArgs = StoryArgs & { bufferFill: keyof typeof bufferFills };

const bufferFillArgTypes: Partial<ArgTypes<BufferFillArgs>> = {
  bufferFill: {
    control: "inline-radio",
    options: Object.keys(bufferFills),
    description: "Prototype: fills the buffer with stripes, a tint or dots.",
  },
};

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

export const Default: StoryFn<StoryArgs> = (args) => (
  <div style={{ width: 400 }}>
    <Progress label="Uploading report.pdf" value={38} {...args} />
  </div>
);

export const Indeterminate: StoryFn<StoryArgs> = (args) => (
  <div style={{ width: 400 }}>
    <Progress label="Loading accounts" {...args} />
  </div>
);

/**
 * The buffer shows how much is ready ahead of the progress, such as the part of a video that has loaded. Use the
 * `bufferFill` control to compare the stripes with a tint or dots.
 */
export const Buffer: StoryFn<BufferFillArgs> = ({ bufferFill, ...args }) => (
  <div style={{ width: 400 }}>
    <Progress
      className={bufferFills[bufferFill]}
      label="Playing video"
      value={38}
      bufferValue={60}
      {...args}
    />
  </div>
);
Buffer.args = { bufferFill: "stripes" };
Buffer.argTypes = bufferFillArgTypes;

export const Circular: StoryFn<StoryArgs> = (args) => (
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

export const ValueText: StoryFn<StoryArgs> = (args) => (
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

export const States: StoryFn<StoryArgs> = (args) => (
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
      <Progress
        shape="circular"
        label="Uploading"
        value={60}
        paused
        {...args}
      />
      <Progress shape="circular" label="Uploading" status="success" {...args} />
      <Progress
        shape="circular"
        label="Uploading"
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
export const IndeterminateToDeterminate: StoryFn<StoryArgs> = (args) => {
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

/**
 * Try the transitions between states, and interrupt them. When the value becomes known, the loop finishes its pass
 * before the bar fills. Success changes color once the bar has filled, and a failed loop stops and fades out.
 */
export const Transitions: StoryFn<StoryArgs> = (args) => {
  const [value, setValue] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<ProgressProps["status"]>(undefined);
  const [paused, setPaused] = useState(false);
  const progressProps = { value, status, paused, ...args };

  // Every control and indicator keeps its size in every state, so nothing moves when you press the buttons
  return (
    <StackLayout gap={3} style={{ width: 400 }}>
      <FlowLayout gap={1}>
        <Button
          onClick={() => {
            setStatus(undefined);
            setValue(undefined);
          }}
        >
          Loop
        </Button>
        <Button
          onClick={() => {
            setStatus(undefined);
            setValue((current) => Math.min((current ?? 0) + 20, 100));
          }}
        >
          Add 20%
        </Button>
        <ToggleButton
          value="pause"
          selected={paused}
          onChange={() => setPaused((current) => !current)}
        >
          Pause
        </ToggleButton>
        <Button onClick={() => setStatus("success")}>Succeed</Button>
        <Button onClick={() => setStatus("error")}>Fail</Button>
      </FlowLayout>
      <Progress label="Uploading report.pdf" {...progressProps} />
      <Progress shape="circular" label="Uploading" {...progressProps} />
      <Progress
        shape="circular"
        size="large"
        label="Uploading"
        {...progressProps}
      />
    </StackLayout>
  );
};

const DownloadButton = ({
  progressProps,
  ...buttonProps
}: ButtonProps & { progressProps?: StoryArgs }) => {
  const { running, value, start } = useSimulatedTask({ sizeUnknownFor: 1500 });

  return (
    // The button stays enabled, as disabled buttons are faded, but it ignores clicks while it's downloading
    <Button
      {...buttonProps}
      onClick={running ? undefined : start}
      aria-busy={running || undefined}
    >
      {running ? (
        <Progress
          shape="circular"
          size="small"
          aria-label="Downloading"
          value={value}
          {...progressProps}
        />
      ) : (
        <DownloadIcon aria-hidden />
      )}
      {/* The label stays the same, so the button keeps its size */}
      Download
    </Button>
  );
};

/**
 * Circular progress fits inside controls, such as a download button. Inside a button it takes the button's text color,
 * like an icon, so it contrasts with every button style.
 */
export const InButton: StoryFn<StoryArgs> = (args) => (
  <FlowLayout gap={1}>
    <DownloadButton sentiment="accented" progressProps={args} />
    <DownloadButton sentiment="neutral" progressProps={args} />
    <DownloadButton
      sentiment="neutral"
      appearance="transparent"
      progressProps={args}
    />
  </FlowLayout>
);

const trackStyles = [
  { name: "Neutral outline (default)", className: undefined },
  { name: "Bar color outline", className: "progressTrackBarOutline" },
];

const linearTrackStyleExamples: ProgressProps[] = [
  { label: "Not started", value: 0 },
  { label: "Uploading", value: 38 },
  { label: "Loading", value: undefined },
  { label: "Playing video", value: 38, bufferValue: 60 },
  { label: "Buffering video", value: 0, bufferValue: 30 },
  { label: "Uploading", value: 60, paused: true },
  { label: "Uploading", value: 60, status: "error" },
  { label: "Uploading", status: "success" },
];

const circularTrackStyleExamples: ProgressProps[] = [
  { shape: "circular", size: "small", "aria-label": "Uploading", value: 38 },
  { shape: "circular", size: "medium", "aria-label": "Uploading", value: 38 },
  { shape: "circular", size: "large", "aria-label": "Uploading", value: 38 },
  {
    shape: "circular",
    size: "medium",
    "aria-label": "Uploading",
    value: 60,
    status: "error",
  },
];

/**
 * Prototype: compares the default neutral outline with a bar color outline, which makes the whole indicator one color.
 * Use the `bufferFill` control to compare the buffers too.
 */
export const TrackStyles: StoryFn<BufferFillArgs> = ({
  bufferFill,
  ...args
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 300px)",
      gap: "var(--salt-spacing-400)",
    }}
  >
    {trackStyles.map(({ name, className }) => (
      <StackLayout gap={2} key={name}>
        <Text styleAs="h3">{name}</Text>
        {linearTrackStyleExamples.map((example, index) => (
          <Progress
            // biome-ignore lint/suspicious/noArrayIndexKey: The examples are static.
            key={index}
            className={clsx(className, bufferFills[bufferFill])}
            {...example}
            {...args}
          />
        ))}
        <FlowLayout gap={3} align="center">
          {circularTrackStyleExamples.map((example, index) => (
            <Progress
              // biome-ignore lint/suspicious/noArrayIndexKey: The examples are static.
              key={index}
              className={className}
              {...example}
              {...args}
            />
          ))}
        </FlowLayout>
      </StackLayout>
    ))}
  </div>
);
TrackStyles.args = { bufferFill: "stripes" };
TrackStyles.argTypes = bufferFillArgTypes;

/** A page loader is a composition, not a component. */
export const PageLoader: StoryFn<StoryArgs> = (args) => (
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
export const Delay: StoryFn<StoryArgs> = (args) => {
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
