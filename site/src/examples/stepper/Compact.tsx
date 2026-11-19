import { CompactStep, CompactStepper } from "@salt-ds/lab";

export const Compact = () => {
  return (
    <CompactStepper aria-label="Checkout progress">
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="active" />
      <CompactStep label="Review" stage="pending" />
      <CompactStep label="Confirmation" stage="pending" />
    </CompactStepper>
  );
};
