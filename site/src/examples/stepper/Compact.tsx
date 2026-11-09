import { Step } from "@salt-ds/core";
import { CompactStepper } from "@salt-ds/lab";

export const Compact = () => {
  return (
    <CompactStepper aria-label="Checkout progress">
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="active" />
      <Step label="Review" stage="pending" />
      <Step label="Confirmation" stage="pending" />
    </CompactStepper>
  );
};
