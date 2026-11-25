import { StackLayout } from "@salt-ds/core";
import { CompactStep, CompactStepper } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Compact Stepper/Compact Stepper QA",
  component: CompactStepper,
  subcomponents: { CompactStep },
} as Meta<typeof CompactStepper>;

export const AllStates: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemPadding={12} {...props}>
    <StackLayout gap={2} style={{ width: 400 }}>
      <CompactStepper>
        <CompactStep label="Personal details" />
        <CompactStep label="Payment details" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="active" />
        <CompactStep label="Payment details" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="active" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="completed" />
        <CompactStep label="Review" stage="active" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="completed" />
        <CompactStep label="Review" stage="completed" />
        <CompactStep label="Confirmation" stage="active" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="active" status="error" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="active" status="warning" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="locked" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep label="Payment details" stage="locked" status="error" />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
    </StackLayout>
    <div style={{ width: 240 }}>
      <CompactStepper>
        <CompactStep label="Personal details" stage="completed" />
        <CompactStep
          label="Confirm the payment details and the billing address for this account"
          stage="active"
          status="error"
        />
        <CompactStep label="Review" />
        <CompactStep label="Confirmation" />
      </CompactStepper>
    </div>
  </QAContainer>
);

AllStates.parameters = {
  chromatic: { disableSnapshot: false },
};
