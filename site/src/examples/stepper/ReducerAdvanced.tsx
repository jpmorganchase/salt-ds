import {
  Button,
  SegmentedButtonGroup,
  StackLayout,
  Step,
  type StepRecord,
  Stepper,
  useStepperReducer,
} from "@salt-ds/core";

const initialSteps: StepRecord[] = [
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
          {
            id: "step-1-3-1",
            label: "Step 1.3.1",
            stage: "active",
          },
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

export const ReducerAdvanced = () => {
  const [state, dispatch] = useStepperReducer(initialSteps);

  return (
    <StackLayout style={{ width: 240 }}>
      <Stepper orientation="vertical">
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </Stepper>
      <SegmentedButtonGroup>
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
        <Button
          onClick={() => {
            dispatch({ type: "reset" });
          }}
        >
          Reset
        </Button>
      </SegmentedButtonGroup>
      <SegmentedButtonGroup>
        {state.started && !state.ended && (
          <>
            <Button
              onClick={() => {
                dispatch({ type: "status/error" });
              }}
            >
              Error
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "status/warning" });
              }}
            >
              Warning
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "status/clear" });
              }}
            >
              Clear
            </Button>
          </>
        )}
      </SegmentedButtonGroup>
    </StackLayout>
  );
};
