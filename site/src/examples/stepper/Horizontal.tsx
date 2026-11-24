import { Step, Stepper } from "@salt-ds/core";

export const Horizontal = () => {
  return (
    <Stepper aria-label="Account opening">
      <Step label="Step" stage="completed" />
      <Step label="Step" stage="active" />
      <Step label="Step" stage="pending" />
      <Step label="Step" stage="pending" />
      <Step label="Step" stage="pending" />
      <Step label="Step" stage="pending" />
    </Stepper>
  );
};
