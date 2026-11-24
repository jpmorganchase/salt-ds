import { Step, Stepper } from "@salt-ds/core";

export const WithDescriptions = () => {
  return (
    <Stepper aria-label="Account opening">
      <Step label="Step" description="Description text" stage="completed" />
      <Step label="Step" description="Description text" stage="active" />
      <Step label="Step" description="Description text" stage="pending" />
      <Step label="Step" description="Description text" stage="pending" />
      <Step label="Step" description="Description text" stage="pending" />
      <Step label="Step" description="Description text" stage="pending" />
    </Stepper>
  );
};
