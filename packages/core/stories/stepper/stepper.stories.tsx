import {
  Button,
  FlexLayout,
  Link,
  Panel,
  SegmentedButtonGroup,
  StackLayout,
  Step,
  type StepProps,
  type StepRecord,
  Stepper,
  type StepperReducerDispatch,
  Text,
  Tooltip,
  useStepperReducer,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { useMemo } from "react";

import "./stepper.stories.css";

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

export const Reducer: StoryFn<typeof Stepper> = () => {
  const [state, dispatch] = useStepperReducer([
    { id: "step-1", label: "Step 1" },
    { id: "step-2", label: "Step 2", stage: "active" }, // <- notice active
    { id: "step-3", label: "Step 3" },
  ]);

  return (
    <StackLayout style={{ width: 320, alignItems: "center" }}>
      <Stepper>
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </Stepper>
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

export const ReducerContent: StoryFn<typeof Stepper> = () => {
  const stepIdToElement = useMemo(
    () => ({
      "step-1": <Text key="step-1-content">Step 1 Content</Text>,
      "step-2": <Text key="step-2-content">Step 2 Content</Text>,
      "step-3": <Text key="step-3-content">Step 3 Content</Text>,
      default: <Text key="default-content">No Step is currently active</Text>,
    }),
    [],
  );

  const [state, dispatch] = useStepperReducer([
    { id: "step-1", label: "Step 1", stage: "active" },
    { id: "step-2", label: "Step 2" },
    { id: "step-3", label: "Step 3" },
  ]);

  const activeStepId = (state.activeStep?.id ??
    "default") as keyof typeof stepIdToElement;

  return (
    <StackLayout style={{ width: 320, alignItems: "center" }}>
      <Stepper>
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </Stepper>
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

export const ReducerAdvanced: StoryFn<typeof Stepper> = () => {
  const initialState: StepRecord[] = useMemo(
    () => [
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
    ],
    [],
  );

  const [state, dispatch] = useStepperReducer(initialState, {
    activeStepId: "step-1-3-2",
  });

  return (
    <StackLayout style={{ width: 240, alignItems: "center" }}>
      <Stepper orientation="vertical">
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </Stepper>
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

export const ReducerLinks: StoryFn<typeof Stepper> = () => {
  // keep the LinkStepProps outside
  interface LinkStepProps extends StepProps {
    id: string;
    dispatch: StepperReducerDispatch;
  }

  // keep the LinkStep outside
  function LinkStep({
    id,
    label: labelProp,
    stage,
    substeps,
    children,
    dispatch,
    ...props
  }: LinkStepProps) {
    const label = useMemo(() => {
      if (stage !== "completed") return labelProp;
      if (children || substeps) return labelProp;

      const ariaLabel = `Go back to ${labelProp}`;

      return (
        <Tooltip content={ariaLabel} placement="bottom">
          <Link
            role="button"
            tabIndex={0}
            onClick={() => {
              dispatch({
                type: "goto",
                payload: id,
              });
            }}
            aria-label={ariaLabel}
            className="linkStep-link"
          >
            {labelProp}
          </Link>
        </Tooltip>
      );
    }, [id, labelProp, substeps, children, stage, dispatch]);

    return (
      <Step id={id} label={label} stage={stage} {...props}>
        {children ||
          substeps?.map((step) => (
            <LinkStep key={step.id} dispatch={dispatch} {...step} />
          ))}
      </Step>
    );
  }

  const initialState: StepRecord[] = useMemo(
    () => [
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
    ],
    [],
  );

  const [state, dispatch] = useStepperReducer(initialState, {
    activeStepId: "step-1-3-2",
  });

  return (
    <StackLayout style={{ width: 240, alignItems: "center" }}>
      <Stepper orientation="vertical">
        {state.steps.map((step) => (
          <LinkStep key={step.id} dispatch={dispatch} {...step} />
        ))}
      </Stepper>
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
