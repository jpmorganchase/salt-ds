import { useMemo } from "react";
import {
  Button,
  Link,
  SegmentedButtonGroup,
  StackLayout,
  Step,
  SteppedTracker,
  type StepRecord,
  Tooltip,
  useStepReducer,
} from "@salt-ds/core";

export const VerticalWithLinks = () => {
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

  const [state, dispatch] = useStepReducer(initialState, {
    activeStepId: "step-1-3-2",
  });

  return (
    <StackLayout style={{ alignItems: "center" }}>
      <SteppedTracker orientation={"vertical"}>
        {state.steps.map((step) => (
          <Step
            key={step.id}
            {...step}
            render={(props) => {
              if (props.stage === "completed") {
                return (
                  <Tooltip content={"reset to first step"} placement={"right"}>
                    <Link
                      tabIndex={0}
                      aria-label="return to first step"
                      className="saltStepAction"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          dispatch({ type: "goto", stepId: "step-1" });
                        }
                      }}
                      onClick={() =>
                        dispatch({ type: "goto", stepId: "step-1" })
                      }
                    >
                      {props.children}
                    </Link>
                  </Tooltip>
                );
              }
              return <>{props.children}</>;
            }}
          />
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
