import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const InProgress = () => {
  return (
    <StackLayout style={{ width: "200px" }}>
      <Stepper orientation="vertical" aria-label="Account opening">
        <Step label="Account details" stage="completed" />
        <Step label="Identity check" stage="inprogress" defaultExpanded>
          <Step label="Photo ID" stage="completed" />
          <Step label="Proof of address" stage="active" />
        </Step>
        <Step label="Review" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
