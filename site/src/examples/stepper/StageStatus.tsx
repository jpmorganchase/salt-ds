import { StackLayout } from "@salt-ds/core";
import { Step, Stepper } from "@salt-ds/lab";

export const StageStatus = () => {
  return (
    <StackLayout style={{ height: "40px", width: "100%" }}>
      <Stepper>
        <Step label="Step" description="Description text" stage="pending" />
        <Step label="Step" description="Description text" stage="inprogress" />
        <Step label="Step" description="Description text" stage="active" />
        <Step label="Step" description="Description text" stage="completed" />
        <Step label="Step" description="Description text" stage="locked" />
        <Step label="Step" description="Description text" status="warning" />
        <Step label="Step" description="Description text" status="error" />
      </Stepper>
    </StackLayout>
  );
};
