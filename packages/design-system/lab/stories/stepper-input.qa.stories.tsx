import { StepperInput } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./stepper-input.qa.stories.css";

export default {
  title: "Lab/Stepper Input/QA",
  component: StepperInput,
} as ComponentMeta<typeof StepperInput>;

const Example = () => (
  <div data-jpmui-test="stepper-input">
    <StepperInput
      decimalPlaces={2}
      defaultValue={0.5}
      max={10}
      min={-5}
      showRefreshButton
      step={0.5}
    />
    <StepperInput
      decimalPlaces={3}
      defaultValue={0.2}
      max={10}
      min={-5}
      showRefreshButton
      step={1}
      textAlign={"center"}
    />

    <StepperInput
      decimalPlaces={1}
      defaultValue={0.88}
      max={5}
      min={0}
      step={1}
      textAlign={"right"}
    />
  </div>
);

export const ExamplesGrid: ComponentStory<typeof StepperInput> = (props) => {
  return (
    <AllRenderer>
      <Example />
    </AllRenderer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof StepperInput> = (
  props
) => {
  return (
    <QAContainer
      height={488}
      width={678}
      className="uitkStepperInputQA"
      imgSrc="/visual-regression-screenshots/StepperInput-vr-snapshot.png"
    >
      <ExamplesGrid />
    </QAContainer>
  );
};
