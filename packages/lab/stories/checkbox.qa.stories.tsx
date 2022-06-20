import { Checkbox } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./checkbox.qa.stories.css";

export default {
  title: "Lab/Checkbox/QA",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

const Checkboxes = () => (
  <div data-jpmui-test="checkboxes">
    <Checkbox label="I understand ADA requires Labels on unchecked checkboxes" />
    <Checkbox
      defaultChecked
      label="I understand ADA requires Labels on checked checkboxes"
    />
    <Checkbox
      defaultChecked
      indeterminate
      label="I understand ADA requires Labels on indeterminate checkboxes"
    />
    <Checkbox
      disabled
      label="I understand ADA requires Labels on indeterminate checkboxes"
    />
  </div>
);

export const AllExamplesGrid: ComponentStory<typeof Checkbox> = () => {
  return (
    <AllRenderer className="uitkCheckboxQA">
      <Checkboxes />
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<
  typeof Checkbox
> = () => {
  return (
    <QAContainer
      width={1145}
      height={512}
      className="uitkCheckboxQA"
      imgSrc="/visual-regression-screenshots/Checkbox-vr-snapshot.png"
    >
      <div className="backwardsCompat">
        <AllExamplesGrid />
      </div>
    </QAContainer>
  );
};
