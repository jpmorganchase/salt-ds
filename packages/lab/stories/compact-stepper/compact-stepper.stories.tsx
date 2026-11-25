import { StackLayout } from "@salt-ds/core";
import { CompactStep, CompactStepper } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Compact Stepper",
  component: CompactStepper,
  subcomponents: { CompactStep },
  args: {
    "aria-label": "Checkout progress",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof CompactStepper>;

export const Default: StoryFn<typeof CompactStepper> = (args) => (
  <CompactStepper {...args}>
    <CompactStep label="Personal details" stage="completed" />
    <CompactStep label="Payment details" stage="active" />
    <CompactStep label="Review" />
    <CompactStep label="Confirmation" />
  </CompactStepper>
);

export const Progress: StoryFn<typeof CompactStepper> = (args) => (
  <StackLayout gap={3}>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="active" />
      <CompactStep label="Payment details" />
      <CompactStep label="Review" />
      <CompactStep label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="active" />
      <CompactStep label="Review" />
      <CompactStep label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="completed" />
      <CompactStep label="Review" stage="active" />
      <CompactStep label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="completed" />
      <CompactStep label="Review" stage="completed" />
      <CompactStep label="Confirmation" stage="active" />
    </CompactStepper>
  </StackLayout>
);

export const StageStatus: StoryFn<typeof CompactStepper> = (args) => (
  <StackLayout gap={3}>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="active" status="error" />
      <CompactStep label="Review" />
      <CompactStep label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="active" status="warning" />
      <CompactStep label="Review" />
      <CompactStep label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <CompactStep label="Personal details" stage="completed" />
      <CompactStep label="Payment details" stage="locked" />
      <CompactStep label="Review" />
      <CompactStep label="Confirmation" />
    </CompactStepper>
  </StackLayout>
);

export const LongText: StoryFn<typeof CompactStepper> = (args) => (
  <div style={{ width: 320 }}>
    <CompactStepper {...args}>
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
);
