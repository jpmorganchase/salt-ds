import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Substeps = () => {
  return (
    <StackLayout style={{ width: "200px" }}>
      <Stepper orientation="vertical" aria-label="Account opening">
        <Step label="Account details" stage="completed">
          <Step label="Name" stage="completed" />
          <Step label="Address" stage="completed" />
        </Step>
        <Step label="Identity check" stage="inprogress" defaultExpanded>
          <Step label="Photo ID" stage="completed" />
          <Step label="Proof of address" stage="active" />
          <Step label="Additional documents" stage="pending">
            <Step label="Bank statement" stage="pending" />
            <Step label="Utility bill" stage="pending" />
          </Step>
        </Step>
        <Step label="Funding" stage="pending">
          <Step label="Funding source" stage="pending" />
          <Step label="First deposit" stage="pending" />
        </Step>
        <Step label="Review" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
