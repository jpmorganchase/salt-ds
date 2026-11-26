import { StackLayout } from "@salt-ds/core";
import { CompactStep, CompactStepper } from "@salt-ds/lab";

export const CompactStageAndStatus = () => {
  return (
    <StackLayout gap={3} style={{ width: "375px" }}>
      <CompactStepper aria-label="Account opening">
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="locked" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper aria-label="Account opening">
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="active" status="warning" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper aria-label="Account opening">
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="active" status="error" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper aria-label="Account opening">
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="completed" />
        <CompactStep label="Review" stage="completed" />
        <CompactStep label="Confirmation" stage="completed" />
      </CompactStepper>
    </StackLayout>
  );
};
