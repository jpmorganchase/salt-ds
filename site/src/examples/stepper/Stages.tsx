import { Step, Stepper } from "@salt-ds/core";

export const Stages = () => {
  return (
    <Stepper aria-label="Account opening">
      <Step label="Account details" stage="completed" />
      <Step label="Identity check" stage="active" />
      <Step label="Funding" stage="pending" />
      <Step label="Review" stage="locked" />
    </Stepper>
  );
};
