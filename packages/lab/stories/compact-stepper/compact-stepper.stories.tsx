import { StackLayout, Step } from "@salt-ds/core";
import { CompactStepper } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Compact Stepper",
  component: CompactStepper,
  subcomponents: { Step },
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
    <Step label="Personal details" stage="completed" />
    <Step label="Payment details" stage="active" />
    <Step label="Review" />
    <Step label="Confirmation" />
  </CompactStepper>
);

export const Progress: StoryFn<typeof CompactStepper> = (args) => (
  <StackLayout gap={3}>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="active" />
      <Step label="Payment details" />
      <Step label="Review" />
      <Step label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="completed" />
      <Step label="Review" stage="active" />
      <Step label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="completed" />
      <Step label="Review" stage="completed" />
      <Step label="Confirmation" stage="active" />
    </CompactStepper>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="completed" />
      <Step label="Review" stage="completed" />
      <Step label="Confirmation" stage="completed" />
    </CompactStepper>
  </StackLayout>
);

export const Statuses: StoryFn<typeof CompactStepper> = (args) => (
  <StackLayout gap={3}>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="active" status="error" />
      <Step label="Review" />
      <Step label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="active" status="warning" />
      <Step label="Review" />
      <Step label="Confirmation" />
    </CompactStepper>
    <CompactStepper {...args}>
      <Step label="Personal details" stage="completed" />
      <Step label="Payment details" stage="locked" />
      <Step label="Review" />
      <Step label="Confirmation" />
    </CompactStepper>
  </StackLayout>
);

export const LongLabel: StoryFn<typeof CompactStepper> = (args) => (
  <div style={{ width: 320 }}>
    <CompactStepper {...args}>
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
);
