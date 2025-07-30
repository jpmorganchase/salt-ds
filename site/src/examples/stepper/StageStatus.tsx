import { Step, Stepper } from "@salt-ds/core";

export const StageStatus = () => {
  return (
    <Stepper>
      <Step label="Pending" description="stage" stage="pending" />
      <Step label="Active" description="stage" stage="active" />
      <Step label="Completed" description="stage" stage="completed" />
      <Step label="Locked" description="stage" stage="locked" />
      <Step label="Error" description="status" status="error" />
      <Step label="Warning" description="status" status="warning" />
    </Stepper>
  );
};
