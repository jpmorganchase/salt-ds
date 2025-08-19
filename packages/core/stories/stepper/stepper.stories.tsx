/** biome-ignore-all lint/correctness/useUniqueElementIds: id isn't the DOM id */
import { StackLayout, Step, Stepper, Text, Tooltip } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Stepper",
  component: Stepper,
  subcomponents: { Step },
} as Meta<typeof Stepper>;

export const Horizontal: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        minWidth: "640px",
        width: "100%",
      }}
    >
      <Stepper>
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" />
      </Stepper>
    </StackLayout>
  );
};

export const HorizontalLongText: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      style={{
        maxWidth: "640px",
        width: "100%",
      }}
    >
      <Stepper>
        <Step
          label="This is a ridiculous long line of text showcasing a step label"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          stage="completed"
        />
        <Step
          label="Oh no!"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          status="error"
        />
        <Step
          label="Last step"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          status="warning"
        />
      </Stepper>
    </StackLayout>
  );
};

export const Vertical: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        minWidth: "240px",
        width: "100%",
      }}
    >
      <Stepper orientation="vertical">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" />
      </Stepper>
    </StackLayout>
  );
};

export const VerticalLongText: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        maxWidth: "240px",
        width: "100%",
      }}
    >
      <Stepper orientation="vertical">
        <Step
          label="This is a ridiculous long line of text showcasing a step label"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          stage="completed"
        />
        <Step
          label="Oh no!"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          status="error"
        />
        <Step
          label="Last step"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          status="warning"
        />
      </Stepper>
    </StackLayout>
  );
};

export const VerticalDepth1: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ width: 240 }}>
      <Stepper orientation="vertical">
        <Step
          id="step-1"
          label="Step 1"
          description="Description text"
          stage="completed"
        >
          <Step id="step-1-1" label="Step 1.1" stage="completed" />
        </Step>

        <Step id="step-2" label="Step 2" stage="inprogress">
          <Step
            id="step-2-1"
            label="Step 2.1"
            description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
            stage="completed"
          />
          <Step
            id="step-2-2"
            label="Step 2.2"
            description="Description text"
            stage="active"
          />
          <Step id="step-2-3" label="Step 2.3" stage="pending" />
        </Step>

        <Step id="step-3" label="Step 3">
          <Step id="step-3-1" label="Step 3.1" />
          <Step id="step-3-2" label="Step 3.2" description="Description text" />
          <Step
            id="step-3-3"
            label="Step 3.3"
            description="This is just a description text"
          />
        </Step>
      </Stepper>
    </StackLayout>
  );
};

export const VerticalDepth2 = () => {
  return (
    <StackLayout style={{ width: 240 }}>
      <Stepper orientation="vertical">
        <Step id="step-1" label="Step 1" description="Description text">
          <Step id="step-1-1" label="Step 1.1" />
        </Step>
        <Step id="step-2" label="Step 2">
          <Step
            id="step-2-1"
            label="Step 2.1"
            description="This is a bit longer of a description."
          />
          <Step id="step-2-2" label="Step 2.2" description="Description text">
            <Step id="step-2-2-1" label="Step 2.2.1" />
            <Step id="step-2-2-2" label="Step 2.2.2" />
            <Step id="step-2-2-3" label="Step 2.2.3" />
          </Step>
        </Step>
        <Step id="step-3" label="Step 3">
          <Step id="step-3-1" label="Step 3.1" />
          <Step id="step-3-2" label="Step 3.2" description="Description text" />
          <Step
            id="step-3-3"
            label="Step 3.3"
            description="This is just a description text"
          >
            <Step id="step-3-3-1" label="Step 3.3.1" />
            <Step id="step-3-3-2" label="Step 3.3.2" />
            <Step id="step-3-3-3" label="Step 3.3.3" />
          </Step>
        </Step>
      </Stepper>
    </StackLayout>
  );
};

export const StageStatus: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      style={{
        minWidth: "640px",
        width: "100%",
      }}
    >
      <Stepper>
        <Step label="Pending" description="stage" stage="pending" />
        <Step label="Inprogress" description="stage" stage="inprogress" />
        <Step label="Active" description="stage" stage="active" />
        <Step label="Completed" description="stage" stage="completed" />
        <Step label="Locked" description="stage" stage="locked" />
        <Step label="Error" description="status" status="error" />
        <Step label="Warning" description="status" status="warning" />
      </Stepper>
    </StackLayout>
  );
};

// Not something we document, but making it possible to use Tooltip with a Step.
export const WithTooltip: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        minWidth: "640px",
        width: "100%",
      }}
    >
      <Stepper>
        <Tooltip placement="bottom" content={<Text>Content step 1</Text>}>
          <Step label="Step 1" stage="completed" />
        </Tooltip>
        <Tooltip placement="bottom" content={<Text>Content step 2</Text>}>
          <Step label="Step 2" stage="active" />
        </Tooltip>
        <Tooltip placement="bottom" content={<Text>Content step 3</Text>}>
          <Step label="Step 3" />
        </Tooltip>
      </Stepper>
    </StackLayout>
  );
};
