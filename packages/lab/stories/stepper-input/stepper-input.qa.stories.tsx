import { StepperInput } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Stepper Input/QA",
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
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
