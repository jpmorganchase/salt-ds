import { StackLayout, Step } from "@salt-ds/core";
import { CompactStepper } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Compact Stepper/Compact Stepper QA",
  component: CompactStepper,
  subcomponents: { Step },
} as Meta<typeof CompactStepper>;

export const AllStates: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemPadding={12} {...props}>
    <StackLayout gap={2} style={{ width: 400 }}>
      <CompactStepper>
        <Step label="Personal details" stage="active" />
        <Step label="Payment details" />
        <Step label="Review" />
        <Step label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <Step label="Personal details" stage="completed" />
        <Step label="Payment details" stage="active" />
        <Step label="Review" />
        <Step label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <Step label="Personal details" stage="completed" />
        <Step label="Payment details" stage="completed" />
        <Step label="Review" stage="completed" />
        <Step label="Confirmation" stage="active" />
      </CompactStepper>
      <CompactStepper>
        <Step label="Personal details" stage="completed" />
        <Step label="Payment details" stage="active" status="error" />
        <Step label="Review" />
        <Step label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <Step label="Personal details" stage="completed" />
        <Step label="Payment details" stage="active" status="warning" />
        <Step label="Review" />
        <Step label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <Step label="Personal details" stage="completed" />
        <Step label="Payment details" stage="locked" />
        <Step label="Review" />
        <Step label="Confirmation" />
      </CompactStepper>
    </StackLayout>
    <div style={{ width: 240 }}>
      <CompactStepper>
        <Step label="Personal details" stage="completed" />
        <Step
          label="Confirm the payment details and the billing address for this account"
          stage="active"
          status="error"
        />
        <Step label="Review" />
        <Step label="Confirmation" />
      </CompactStepper>
    </div>
  </QAContainer>
);

AllStates.parameters = {
  chromatic: { disableSnapshot: false },
};
