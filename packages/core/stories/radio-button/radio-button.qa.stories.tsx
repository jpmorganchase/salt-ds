import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Radio Button/QA",
  component: RadioButton,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof RadioButton>;

const RadioButtonGroupsVertical = () => {
  return (
    <>
      <RadioButtonGroup defaultValue="option2">
        <RadioButton key="option1" label="Radio Option 1" value="option1" />
        <RadioButton key="option2" label="Radio Option 2" value="option2" />
        <RadioButton
          disabled
          key="option3"
          label="Radio Option 3 (disabled)"
          value="option3"
        />
        <RadioButton
          readOnly
          key="option4"
          label="Radio Option 4 (read-only)"
          value="option4"
        />
        <RadioButton
          label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
          value="option5"
        />
      </RadioButtonGroup>
    </>
  );
};

const RadioButtonGroupsHorizontal = () => {
  return (
    <>
      <RadioButtonGroup direction={"horizontal"} defaultValue="option2">
        <RadioButton key="option1" label="Radio Option 1" value="option1" />
        <RadioButton key="option2" label="Radio Option 2" value="option2" />
        <RadioButton
          disabled
          key="option3"
          label="Radio Option 3 (disabled)"
          value="option3"
        />
        <RadioButton
          readOnly
          key="option4"
          label="Radio Option 4 (read-only)"
          value="option4"
        />
        <RadioButton
          label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
          value="option5"
        />
      </RadioButtonGroup>
    </>
  );
};

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={2} itemPadding={6} itemWidthAuto {...props}>
      <RadioButtonGroupsVertical />
      <RadioButtonGroupsHorizontal />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
