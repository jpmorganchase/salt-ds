import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Status = () => {
  return (
    <StackLayout gap={6} style={{ width: "100%" }}>
      <Stepper aria-label="Account opening">
        <Step label="Account details" stage="completed" />
        <Step
          label="Identity check"
          description="Your photo ID expires soon"
          stage="active"
          status="warning"
        />
        <Step label="Funding" stage="pending" />
        <Step label="Review" stage="pending" />
      </Stepper>
      <Stepper aria-label="Account opening">
        <Step label="Account details" stage="completed" />
        <Step
          label="Identity check"
          description="Upload a photo ID"
          stage="active"
          status="error"
        />
        <Step label="Funding" stage="pending" />
        <Step label="Review" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
