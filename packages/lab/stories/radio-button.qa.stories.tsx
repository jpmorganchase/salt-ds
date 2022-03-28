import { FormField, RadioButton, RadioButtonGroup } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./radio-button.qa.stories.css";

export default {
  title: "Lab/Radio Button/QA",
  component: RadioButton,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof RadioButton>;

export const CompareWithOriginalToolkit: ComponentStory<typeof RadioButton> = (
  props
) => {
  return (
    <QAContainer
      width={1180}
      height={709}
      imgSrc="/visual-regression-screenshots/RadioButton-vr-snapshot.png"
    >
      <AllRenderer>
        <div
          style={{
            background: "inherit",
            display: "inline-grid",
            gridTemplate: "auto / repeat(4,auto)",
            gap: "4px",
          }}
        >
          <RadioButtonGroup
            aria-label="Uncontrolled Example"
            defaultValue="forward"
            legend="Example"
          >
            <RadioButton key="spot" label="Spot" value="spot" />
            <RadioButton key="forward" label="Forward" value="forward" />
            <RadioButton
              disabled
              key="option"
              label="Option (disabled)"
              value="option"
            />
          </RadioButtonGroup>
        </div>
      </AllRenderer>
      <AllRenderer>
        <RadioButtonGroup defaultValue="forward" legend="Example" name="fx" row>
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton
            disabled
            key="option"
            label="Option (disabled)"
            value="option"
          />
        </RadioButtonGroup>
      </AllRenderer>
    </QAContainer>
  );
};
