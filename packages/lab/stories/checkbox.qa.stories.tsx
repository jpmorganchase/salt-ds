import { Checkbox } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./checkbox.qa.stories.css";

export default {
  title: "Lab/Checkbox/QA",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

export const AllExamplesGrid: ComponentStory<typeof Checkbox> = (props) => {
  const { className } = props;
  return (
    <AllRenderer className="uitkCheckboxQA">
      <div data-jpmui-test="checkboxes">
        <Checkbox
          className={className}
          label="I understand ADA requires Labels on unchecked checkboxes"
        />
        <Checkbox
          className={className}
          defaultChecked
          label="I understand ADA requires Labels on checked checkboxes"
        />
        <Checkbox
          className={className}
          defaultChecked
          indeterminate
          label="I understand ADA requires Labels on indeterminate checkboxes"
        />
        <Checkbox
          className={className}
          disabled
          label="I understand ADA requires Labels on indeterminate checkboxes"
        />
      </div>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
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
      <BackwardsCompatGrid className="backwardsCompat" />
    </QAContainer>
  );
};
