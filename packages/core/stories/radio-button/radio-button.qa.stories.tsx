import {
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  type RadioButtonGroupProps,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Radio Button/Radio Button QA",
  component: RadioButton,
} as Meta<typeof RadioButton>;

const RadioButtonGroupExample = ({
  direction,
}: Pick<RadioButtonGroupProps, "direction">) => {
  return (
    <RadioButtonGroup defaultValue="option2" direction={direction}>
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
  );
};

const RadioButtonCheckedReadonlyGroupExample = () => {
  return (
    <RadioButtonGroup defaultValue="option4">
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
  );
};

const RadioButtonInFormFieldExample = () => {
  return (
    <FormField labelPlacement="left">
      <FormFieldLabel>Assignment</FormFieldLabel>
      <RadioButtonGroup>
        <RadioButton label="Private placement of equity or debt securities" />
        <RadioButton label="Syndicated credit facility or loan" />
        <RadioButton label="Interest rate, foreign exchange or commodity hedging or equity derivative" />
        <RadioButton label="Escrow arrangement" />
        <RadioButton label="Restructuring of debt securities of the Counterparty or the Company" />
      </RadioButtonGroup>
    </FormField>
  );
};

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={1} itemPadding={8} {...props}>
      <RadioButtonGroupExample direction="vertical" />
      <RadioButtonGroupExample direction="horizontal" />
      <RadioButtonCheckedReadonlyGroupExample />
      <RadioButtonInFormFieldExample />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
