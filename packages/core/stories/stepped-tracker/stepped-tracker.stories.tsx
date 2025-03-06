import {
  Button,
  FlexLayout,
  Panel,
  SegmentedButtonGroup,
  StackLayout,
  Step,
  type StepRecord,
  SteppedTracker,
  Text,
  useStepReducer,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { useEffect } from "react";

export default {
  title: "Core/SteppedTracker",
  component: SteppedTracker,
  subcomponents: { Step },
} as Meta<typeof SteppedTracker>;

export const Horizontal: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        minWidth: "640px",
        width: "100%",
      }}
    >
      <SteppedTracker>
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" />
      </SteppedTracker>
    </StackLayout>
  );
};

export const HorizontalVariations: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      style={{
        minWidth: "640px",
        width: "100%",
      }}
    >
      <SteppedTracker>
        <Step label="Step" description="Description text" stage="pending" />
        <Step label="Step" description="Description text" stage="inprogress" />
        <Step label="Step" description="Description text" stage="active" />
        <Step label="Step" description="Description text" stage="completed" />
        <Step label="Step" description="Description text" status="error" />
        <Step label="Step" description="Description text" status="warning" />
        <Step label="Step" description="Description text" stage="locked" />
      </SteppedTracker>
    </StackLayout>
  );
};

export const HorizontalLongText: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      style={{
        maxWidth: "320px",
        width: "100%",
      }}
    >
      <SteppedTracker>
        <Step
          label="This is a ridiculous long line of text showcasing a step label"
          description="This is just a description text"
          stage="completed"
        />
        <Step
          label="Oh no!"
          description="This is another ridiculous long line of text showcasing an error message"
          status="error"
        />
        <Step
          label="Last step"
          description="This is another ridiculous long line of text to test a warning message"
          status="warning"
        />
      </SteppedTracker>
    </StackLayout>
  );
};

export const HorizontalInteractiveUsingSteppedReducer: StoryFn<
  typeof SteppedTracker
> = () => {
  const [state, dispatch] = useStepReducer([
    { id: "step-1", label: "Step 1", stage: "active" },
    { id: "step-2", label: "Step 2" },
    { id: "step-3", label: "Step 3" },
  ]);

  function handleNext() {
    console.log("Before", state);
    dispatch({ type: "next" });
  }

  useEffect(() => {
    console.log("After", state);
  }, [state]);

  return (
    <StackLayout style={{ width: 320, alignItems: "center" }}>
      <SteppedTracker>
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </SteppedTracker>
      <FlexLayout justify="space-between">
        {state.started && (
          <Button
            onClick={() => {
              dispatch({ type: "previous" });
            }}
          >
            Previous
          </Button>
        )}
        {!state.ended && <Button onClick={handleNext}>Next</Button>}
      </FlexLayout>
    </StackLayout>
  );
};

export const Vertical: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        minWidth: "240px",
        width: "100%",
      }}
    >
      <SteppedTracker orientation="vertical">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" />
      </SteppedTracker>
    </StackLayout>
  );
};

export const VerticalVariations: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout style={{ maxWidth: "240px", width: "100%" }}>
      <SteppedTracker orientation="vertical">
        <Step label="Step" description="Description text" stage="pending" />
        <Step label="Step" description="Description text" stage="inprogress" />
        <Step label="Step" description="Description text" stage="active" />
        <Step label="Step" description="Description text" stage="completed" />
        <Step label="Step" description="Description text" status="error" />
        <Step label="Step" description="Description text" status="warning" />
        <Step label="Step" description="Description text" stage="locked" />
      </SteppedTracker>
    </StackLayout>
  );
};

export const VerticalLongText: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        maxWidth: "240px",
        width: "100%",
      }}
    >
      <SteppedTracker orientation="vertical">
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
      </SteppedTracker>
    </StackLayout>
  );
};

export const VerticalDepth1: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout style={{ width: 240 }}>
      <SteppedTracker orientation="vertical">
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
      </SteppedTracker>
    </StackLayout>
  );
};

export const VerticalDepth2 = () => {
  return (
    <StackLayout style={{ width: 240 }}>
      <SteppedTracker orientation="vertical">
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
      </SteppedTracker>
    </StackLayout>
  );
};

export const VerticalInteractiveUsingSteppedReducer: StoryFn<
  typeof SteppedTracker
> = () => {
  const initialState: StepRecord[] = [
    {
      id: "step-1",
      label: "Step 1",
      defaultExpanded: true,
      substeps: [
        { id: "step-1-1", label: "Step 1.1" },
        { id: "step-1-2", label: "Step 1.2" },
        {
          id: "step-1-3",
          label: "Step 1.3",
          defaultExpanded: true,
          substeps: [
            { id: "step-1-3-1", label: "Step 1.3.1" },
            { id: "step-1-3-2", label: "Step 1.3.2" },
            {
              id: "step-1-3-3",
              label: "Step 1.3.3",
              description: "This is just a description text",
            },
          ],
        },
        { id: "step-1-4", label: "Step 1.4" },
      ],
    },
    { id: "step-2", label: "Step 2" },
    { id: "step-3", label: "Step 3" },
  ];

  const [state, dispatch] = useStepReducer(initialState, {
    activeStepId: "step-1-3-2",
  });

  return (
    <StackLayout style={{ width: 240, alignItems: "center" }}>
      <SteppedTracker orientation="vertical">
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </SteppedTracker>
      <SegmentedButtonGroup>
        <Button
          onClick={() => {
            dispatch({ type: "previous" });
          }}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            dispatch({ type: "next" });
          }}
        >
          Next
        </Button>
      </SegmentedButtonGroup>
      <SegmentedButtonGroup>
        <Button onClick={() => dispatch({ type: "status/error" })}>
          Error
        </Button>
        <Button onClick={() => dispatch({ type: "status/warning" })}>
          Warning
        </Button>
        <Button onClick={() => dispatch({ type: "status/clear" })}>
          Clear
        </Button>
        <Button onClick={() => dispatch({ type: "reset" })}>Reset</Button>
      </SegmentedButtonGroup>
    </StackLayout>
  );
};

export const BareBones: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout style={{ minWidth: "240px", width: "100%" }}>
      <SteppedTracker>
        <Step stage="completed" />
        <Step stage="active" />
        <Step />
      </SteppedTracker>
    </StackLayout>
  );
};

export const ProgrammaticElement: StoryFn<typeof SteppedTracker> = () => {
  // place this outside to avoid re-rendering
  const stepIdToElement = {
    "step-1": <Text key="step-1-content">Step 1 Content</Text>,
    "step-2": <Text key="step-2-content">Step 2 Content</Text>,
    "step-3": <Text key="step-3-content">Step 3 Content</Text>,
    default: <Text key="default-content">No Step is currently active</Text>,
  };

  const [state, dispatch] = useStepReducer([
    { id: "step-1", label: "Step 1", stage: "active" },
    { id: "step-2", label: "Step 2" },
    { id: "step-3", label: "Step 3" },
  ]);

  const activeStepId = (state.activeStep?.id ??
    "default") as keyof typeof stepIdToElement;

  return (
    <StackLayout style={{ width: 320, alignItems: "center" }}>
      <SteppedTracker>
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </SteppedTracker>
      <Panel variant="secondary">{stepIdToElement[activeStepId]}</Panel>
      <FlexLayout justify="space-between">
        {state.started && (
          <Button
            onClick={() => {
              dispatch({ type: "previous" });
            }}
          >
            Previous
          </Button>
        )}
        {!state.ended && (
          <Button
            onClick={() => {
              dispatch({ type: "next" });
            }}
          >
            Next
          </Button>
        )}
      </FlexLayout>
    </StackLayout>
  );
};
