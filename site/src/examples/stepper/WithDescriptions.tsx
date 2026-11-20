import { Step, Stepper } from "@salt-ds/core";

export const WithDescriptions = () => {
  return (
    <Stepper aria-label="Account opening">
      <Step
        label="Account details"
        description="Name and address"
        stage="completed"
      />
      <Step
        label="Identity check"
        description="Photo ID and proof of address"
        stage="active"
      />
      <Step
        label="Funding"
        description="All fields are optional"
        stage="pending"
      />
      <Step label="Review" description="Check and submit" stage="pending" />
    </Stepper>
  );
};
