import { RadioButton, RadioButtonGroup } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Radio Button/QA",
  component: RadioButton,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof RadioButton>;

const RadioButtonGroups = () => {
  return (
    <>
      <RadioButtonGroup>
        <RadioButton key="option1" label="Radio Option 1" value="option1" />
        <RadioButton key="option2" label="Radio Option 2" value="option2" />
        <RadioButton
          disabled
          key="option3"
          label="Radio Option 3 (disabled)"
          value="option3"
        />
      </RadioButtonGroup>
      <RadioButtonGroup direction={"horizontal"}>
        <RadioButton key="option1" label="Radio Option 1" value="option1" />
        <RadioButton key="option2" label="Radio Option 2" value="option2" />
        <RadioButton
          disabled
          key="option3"
          label="Radio Option 3 (disabled)"
          value="option3"
        />
      </RadioButtonGroup>
    </>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={2} itemPadding={6} itemWidthAuto {...props}>
      <RadioButtonGroups />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
