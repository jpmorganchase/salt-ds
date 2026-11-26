import { StackLayout } from "@salt-ds/core";
import { CompactStep, CompactStepper } from "@salt-ds/lab";

export const Compact = () => {
  return (
    <StackLayout style={{ width: "375px" }}>
      <CompactStepper aria-label="Account opening">
        <CompactStep label="Step title" stage="completed" />
        <CompactStep label="Step title" stage="active" />
        <CompactStep label="Step title" stage="pending" />
        <CompactStep label="Step title" stage="pending" />
        <CompactStep label="Step title" stage="pending" />
        <CompactStep label="Step title" stage="pending" />
      </CompactStepper>
    </StackLayout>
  );
};
