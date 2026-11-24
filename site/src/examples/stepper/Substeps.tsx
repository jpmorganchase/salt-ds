import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Substeps = () => {
  return (
    <StackLayout style={{ width: "220px" }}>
      <Stepper orientation="vertical" aria-label="Account opening">
        <Step label="Step" description="Description text" stage="completed">
          <Step label="Substep: Level 1" stage="completed" />
        </Step>
        <Step
          label="Step"
          description="Description text"
          stage="inprogress"
          defaultExpanded
        >
          <Step label="Substep: Level 1" stage="inprogress" defaultExpanded>
            <Step label="Substep: Level 2" stage="active" />
            <Step label="Substep: Level 2" stage="pending" />
          </Step>
        </Step>
        <Step label="Step" description="Description text" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
