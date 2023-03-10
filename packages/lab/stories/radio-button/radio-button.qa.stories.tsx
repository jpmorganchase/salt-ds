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

const RadioButtonVariations = () => {
  return (
    <>
      <RadioButton label="Unchecked" value="Unchecked" />
      <RadioButton label="Checked" value="Checked" checked />
      <RadioButton disabled label="Disabled" value="Disabled" />
      <RadioButton
        disabled
        label="Disabled checked"
        value="Disabled-checked"
        checked
      />

      <RadioButton label="Error unchecked" value="Error-unchecked" error />
      <RadioButton label="Error checked" value="Error-checked" checked error />
      <RadioButton
        label="Disabled error"
        value="disabled-error"
        disabled
        error
      />
      <RadioButton
        label="Disabled error checked"
        value="disabled-error-checked"
        checked
        disabled
        error
      />
    </>
  );
};

export const AllExamplesGrid: Story<
  QAContainerProps & { className?: string }
> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={2} itemPadding={6} itemWidthAuto {...props}>
      <RadioButtonGroup
        className={className}
        aria-label="Uncontrolled Example"
        defaultValue="forward"
      >
        <RadioButtonVariations />
      </RadioButtonGroup>
      <RadioButtonGroup
        className={className}
        defaultValue="forward"
        name="fx"
        direction={"horizontal"}
      >
        <RadioButtonVariations />
      </RadioButtonGroup>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
