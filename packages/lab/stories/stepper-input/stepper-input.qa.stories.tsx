import { StepperInput } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Stepper Input/Stepper Input QA",
  component: StepperInput,
} as Meta<typeof StepperInput>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer {...props}>
      <StepperInput
        decimalPlaces={2}
        defaultValue={0.5}
        max={10}
        min={-5}
        step={0.5}
      />
      <StepperInput
        decimalPlaces={3}
        defaultValue={-5}
        max={10}
        min={-5}
        step={1}
        textAlign={"center"}
      />
      <StepperInput
        decimalPlaces={1}
        defaultValue={5}
        max={5}
        min={0}
        step={1}
        textAlign={"right"}
      />
      <StepperInput
        decimalPlaces={2}
        defaultValue={0.5}
        max={10}
        min={-5}
        readOnly
        step={0.5}
      />
      <StepperInput
        decimalPlaces={2}
        defaultValue={0.5}
        disabled
        max={10}
        min={-5}
        step={0.5}
      />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
